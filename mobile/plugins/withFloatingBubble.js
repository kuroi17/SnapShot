const {
  withAndroidManifest,
  withDangerousMod,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PKG_NAME = "withFloatingBubble";
const PKG_VERSION = "1.0.0";

function addPermissionsToManifest(androidManifest) {
  const mainApplication = androidManifest.manifest.application?.[0];
  const permissions = androidManifest.manifest["uses-permission"] || [];

  const requiredPermissions = [
    "android.permission.SYSTEM_ALERT_WINDOW",
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.FOREGROUND_SERVICE_SPECIAL_USE",
    "android.permission.POST_NOTIFICATIONS",
  ];

  for (const perm of requiredPermissions) {
    if (!permissions.some((p) => p.$?.["android:name"] === perm)) {
      permissions.push({
        $: { "android:name": perm },
      });
    }
  }
  androidManifest.manifest["uses-permission"] = permissions;

  if (mainApplication) {
    let services = mainApplication.service || [];
    const serviceName = ".FloatingBubbleService";
    if (!services.some((s) => s.$?.["android:name"] === serviceName)) {
      services.push({
        $: {
          "android:name": serviceName,
          "android:enabled": "true",
          "android:exported": "false",
          "android:foregroundServiceType": "specialUse",
        },
        property: [
          {
            $: {
              "android:name": "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE",
              "android:value": "Floating camera capture overlay trigger",
            },
          },
        ],
      });
      mainApplication.service = services;
    }
  }

  return androidManifest;
}

const FLOATING_BUBBLE_SERVICE_KT = `package com.kuroi17.snapshot

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.RelativeLayout
import androidx.core.app.NotificationCompat

class FloatingBubbleService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingView: RelativeLayout? = null
    private var params: WindowManager.LayoutParams? = null

    companion object {
        const val CHANNEL_ID = "snapshot_floating_bubble_channel"
        const val NOTIFICATION_ID = 9527
        var isRunning = false
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        createFloatingBubble()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SnapShot Capture Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Active floating bubble for instant screen capture"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SnapShot Active")
            .setContentText("Tap the floating camera bubble to capture and remove background")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createFloatingBubble() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val sizePx = (56 * resources.displayMetrics.density).toInt()
        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            sizePx,
            sizePx,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = resources.displayMetrics.widthPixels - sizePx - 24
            y = (resources.displayMetrics.heightPixels * 0.4).toInt()
        }

        floatingView = RelativeLayout(this).apply {
            val bg = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#E60C0D0E"))
                setStroke((2 * resources.displayMetrics.density).toInt(), Color.parseColor("#00F0FF"))
            }
            background = bg

            val cameraIcon = ImageView(context).apply {
                setImageResource(android.R.drawable.ic_menu_camera)
                setColorFilter(Color.parseColor("#00F0FF"))
                val iconSize = (28 * resources.displayMetrics.density).toInt()
                val iconParams = RelativeLayout.LayoutParams(iconSize, iconSize).apply {
                    addRule(RelativeLayout.CENTER_IN_PARENT)
                }
                layoutParams = iconParams
            }
            addView(cameraIcon)
        }

        floatingView?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var isClick = false

            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                if (event == null || params == null) return false

                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params!!.x
                        initialY = params!!.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        isClick = true
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - initialTouchX).toInt()
                        val dy = (event.rawY - initialTouchY).toInt()

                        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                            isClick = false
                        }

                        params!!.x = initialX + dx
                        params!!.y = initialY + dy
                        windowManager?.updateViewLayout(floatingView, params)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        if (isClick) {
                            onBubbleClicked()
                        } else {
                            snapToEdge()
                        }
                        return true
                    }
                }
                return false
            }
        })

        try {
            windowManager?.addView(floatingView, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun snapToEdge() {
        if (params == null || floatingView == null) return
        val screenWidth = resources.displayMetrics.widthPixels
        val sizePx = floatingView!!.width
        val currentX = params!!.x

        val targetX = if (currentX + sizePx / 2 < screenWidth / 2) {
            16
        } else {
            screenWidth - sizePx - 16
        }

        params!!.x = targetX
        windowManager?.updateViewLayout(floatingView, params)
    }

    private fun onBubbleClicked() {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra("route", "/capture")
        }
        if (launchIntent != null) {
            startActivity(launchIntent)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        if (floatingView != null) {
            try {
                windowManager?.removeView(floatingView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            floatingView = null
        }
    }
}
`;

const FLOATING_BUBBLE_MODULE_KT = `package com.kuroi17.snapshot

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FloatingBubbleModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "FloatingBubble"

    @ReactMethod
    fun hasPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(reactContext))
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(reactContext)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactContext.packageName)
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
            }
            promise.resolve(true)
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun showBubble(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
                promise.reject("PERMISSION_DENIED", "Overlay permission not granted")
                return
            }

            val intent = Intent(reactContext, FloatingBubbleService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun hideBubble(promise: Promise) {
        try {
            val intent = Intent(reactContext, FloatingBubbleService::class.java)
            reactContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isBubbleShowing(promise: Promise) {
        promise.resolve(FloatingBubbleService.isRunning)
    }
}
`;

const FLOATING_BUBBLE_PACKAGE_KT = `package com.kuroi17.snapshot

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class FloatingBubblePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(FloatingBubbleModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<View, ReactShadowNode<*>>> {
        return emptyList()
    }
}
`;

function withFloatingBubbleNativeFiles(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const androidSrcDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        "com",
        "kuroi17",
        "snapshot"
      );

      fs.mkdirSync(androidSrcDir, { recursive: true });

      fs.writeFileSync(
        path.join(androidSrcDir, "FloatingBubbleService.kt"),
        FLOATING_BUBBLE_SERVICE_KT,
        "utf8"
      );
      fs.writeFileSync(
        path.join(androidSrcDir, "FloatingBubbleModule.kt"),
        FLOATING_BUBBLE_MODULE_KT,
        "utf8"
      );
      fs.writeFileSync(
        path.join(androidSrcDir, "FloatingBubblePackage.kt"),
        FLOATING_BUBBLE_PACKAGE_KT,
        "utf8"
      );

      // Register package in MainApplication.kt
      const mainAppPath = path.join(androidSrcDir, "MainApplication.kt");
      if (fs.existsSync(mainAppPath)) {
        let content = fs.readFileSync(mainAppPath, "utf8");
        if (!content.includes("FloatingBubblePackage()")) {
          content = content.replace(
            /PackageList\(this\)\.packages\.apply\s*\{/,
            "PackageList(this).packages.apply {\n            add(FloatingBubblePackage())"
          );
          fs.writeFileSync(mainAppPath, content, "utf8");
        }
      }

      return config;
    },
  ]);
}

function withFloatingBubble(config) {
  config = withAndroidManifest(config, (config) => {
    config.modResults = addPermissionsToManifest(config.modResults);
    return config;
  });
  config = withFloatingBubbleNativeFiles(config);
  return config;
}

module.exports = createRunOncePlugin(withFloatingBubble, PKG_NAME, PKG_VERSION);
