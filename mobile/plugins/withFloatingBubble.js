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
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.PixelFormat
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.RelativeLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import kotlin.math.sqrt

class CropOverlayView(
    context: Context,
    private val onCapture: (RectF) -> Unit,
    private val onCancel: () -> Unit
) : FrameLayout(context) {

    val cropRect = RectF()
    private val dimPaint = Paint().apply {
        color = Color.parseColor("#80000000") // 50% dark dim
    }
    private val clearPaint = Paint().apply {
        xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
    }
    private val borderPaint = Paint().apply {
        color = Color.parseColor("#00F0FF")
        style = Paint.Style.STROKE
        strokeWidth = 2.5f * resources.displayMetrics.density
        pathEffect = DashPathEffect(floatArrayOf(15f, 10f), 0f)
        isAntiAlias = true
    }
    private val handlePaint = Paint().apply {
        color = Color.parseColor("#00F0FF")
        style = Paint.Style.FILL
        isAntiAlias = true
    }
    private val handleBorderPaint = Paint().apply {
        color = Color.WHITE
        style = Paint.Style.STROKE
        strokeWidth = 1.5f * resources.displayMetrics.density
        isAntiAlias = true
    }
    private val textPaint = Paint().apply {
        color = Color.parseColor("#00F0FF")
        textSize = 12f * resources.displayMetrics.scaledDensity
        isAntiAlias = true
        isFakeBoldText = true
    }
    private val badgePaint = Paint().apply {
        color = Color.parseColor("#E60C0D0E")
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private var touchMode = 0 // 0: none, 1: drag body, 2..9: handles, 10: new drag
    private var lastTouchX = 0f
    private var lastTouchY = 0f
    private val handleRadius = 24f * resources.displayMetrics.density
    private val minSize = 60f * resources.displayMetrics.density

    init {
        setWillNotDraw(false)
        setLayerType(LAYER_TYPE_HARDWARE, null)

        val screenW = resources.displayMetrics.widthPixels.toFloat()
        val screenH = resources.displayMetrics.heightPixels.toFloat()

        val defaultW = screenW * 0.75f
        val defaultH = screenH * 0.40f
        val left = (screenW - defaultW) / 2f
        val top = screenH * 0.28f
        cropRect.set(left, top, left + defaultW, top + defaultH)

        val buttonsLayout = LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            val lp = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT).apply {
                gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                bottomMargin = (36 * resources.displayMetrics.density).toInt()
            }
            layoutParams = lp

            val captureBtn = TextView(context).apply {
                text = "✂️  Capture"
                setTextColor(Color.parseColor("#0C0D0E"))
                textSize = 14f
                setTypeface(null, android.graphics.Typeface.BOLD)
                gravity = Gravity.CENTER
                val padH = (24 * resources.displayMetrics.density).toInt()
                val padV = (12 * resources.displayMetrics.density).toInt()
                setPadding(padH, padV, padH, padV)
                background = GradientDrawable().apply {
                    setColor(Color.parseColor("#00F0FF"))
                    cornerRadius = 24 * resources.displayMetrics.density
                }
                setOnClickListener {
                    onCapture(RectF(cropRect))
                }
            }

            val cancelBtn = TextView(context).apply {
                text = "✕  Cancel"
                setTextColor(Color.WHITE)
                textSize = 14f
                setTypeface(null, android.graphics.Typeface.BOLD)
                gravity = Gravity.CENTER
                val padH = (20 * resources.displayMetrics.density).toInt()
                val padV = (12 * resources.displayMetrics.density).toInt()
                setPadding(padH, padV, padH, padV)
                background = GradientDrawable().apply {
                    setColor(Color.parseColor("#33FFFFFF"))
                    cornerRadius = 24 * resources.displayMetrics.density
                    setStroke((1 * resources.displayMetrics.density).toInt(), Color.parseColor("#66FFFFFF"))
                }
                val marginParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    marginStart = (16 * resources.displayMetrics.density).toInt()
                }
                layoutParams = marginParams
                setOnClickListener {
                    onCancel()
                }
            }

            addView(captureBtn)
            addView(cancelBtn)
        }

        addView(buttonsLayout)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        // 1. Draw 50% dim over screen
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), dimPaint)

        // 2. Punch clear hole inside marquee so underlying app is 100% visible
        canvas.drawRect(cropRect, clearPaint)

        // 3. Draw cyan dashed border
        canvas.drawRect(cropRect, borderPaint)

        // 4. Draw 8 corner & edge handles
        val midX = cropRect.centerX()
        val midY = cropRect.centerY()
        val hSize = 6f * resources.displayMetrics.density

        val points = arrayOf(
            Pair(cropRect.left, cropRect.top),
            Pair(midX, cropRect.top),
            Pair(cropRect.right, cropRect.top),
            Pair(cropRect.right, midY),
            Pair(cropRect.right, cropRect.bottom),
            Pair(midX, cropRect.bottom),
            Pair(cropRect.left, cropRect.bottom),
            Pair(cropRect.left, midY)
        )

        for ((px, py) in points) {
            canvas.drawRect(px - hSize, py - hSize, px + hSize, py + hSize, handlePaint)
            canvas.drawRect(px - hSize, py - hSize, px + hSize, py + hSize, handleBorderPaint)
        }

        // 5. Draw Dimension Badge
        val label = "\${cropRect.width().toInt()} × \${cropRect.height().toInt()}"
        val textWidth = textPaint.measureText(label)
        val badgeW = textWidth + 24f * resources.displayMetrics.density
        val badgeH = 22f * resources.displayMetrics.density
        val badgeX = cropRect.left
        val badgeY = (cropRect.top - badgeH - 6f).coerceAtLeast(16f)

        val badgeRect = RectF(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH)
        canvas.drawRoundRect(badgeRect, 6f, 6f, badgePaint)
        canvas.drawRoundRect(badgeRect, 6f, 6f, handleBorderPaint)
        canvas.drawText(label, badgeX + 12f * resources.displayMetrics.density, badgeY + badgeH - 6f, textPaint)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val x = event.x
        val y = event.y

        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                lastTouchX = x
                lastTouchY = y

                touchMode = getHandleAt(x, y)
                if (touchMode == 0) {
                    if (cropRect.contains(x, y)) {
                        touchMode = 1 // Drag body
                    } else {
                        // Start new box drag
                        touchMode = 10
                        cropRect.set(x, y, x + 10, y + 10)
                        invalidate()
                    }
                }
                return true
            }

            MotionEvent.ACTION_MOVE -> {
                val dx = x - lastTouchX
                val dy = y - lastTouchY
                lastTouchX = x
                lastTouchY = y

                when (touchMode) {
                    1 -> { // Drag body
                        val w = cropRect.width()
                        val h = cropRect.height()
                        val newL = (cropRect.left + dx).coerceIn(0f, width - w)
                        val newT = (cropRect.top + dy).coerceIn(0f, height - h)
                        cropRect.set(newL, newT, newL + w, newT + h)
                    }
                    2 -> { // Top-Left
                        cropRect.left = (cropRect.left + dx).coerceAtMost(cropRect.right - minSize)
                        cropRect.top = (cropRect.top + dy).coerceAtMost(cropRect.bottom - minSize)
                    }
                    3 -> { // Top-Center
                        cropRect.top = (cropRect.top + dy).coerceAtMost(cropRect.bottom - minSize)
                    }
                    4 -> { // Top-Right
                        cropRect.right = (cropRect.right + dx).coerceAtLeast(cropRect.left + minSize)
                        cropRect.top = (cropRect.top + dy).coerceAtMost(cropRect.bottom - minSize)
                    }
                    5 -> { // Right-Center
                        cropRect.right = (cropRect.right + dx).coerceAtLeast(cropRect.left + minSize)
                    }
                    6 -> { // Bottom-Right
                        cropRect.right = (cropRect.right + dx).coerceAtLeast(cropRect.left + minSize)
                        cropRect.bottom = (cropRect.bottom + dy).coerceAtLeast(cropRect.top + minSize)
                    }
                    7 -> { // Bottom-Center
                        cropRect.bottom = (cropRect.bottom + dy).coerceAtLeast(cropRect.top + minSize)
                    }
                    8 -> { // Bottom-Left
                        cropRect.left = (cropRect.left + dx).coerceAtMost(cropRect.right - minSize)
                        cropRect.bottom = (cropRect.bottom + dy).coerceAtLeast(cropRect.top + minSize)
                    }
                    9 -> { // Left-Center
                        cropRect.left = (cropRect.left + dx).coerceAtMost(cropRect.right - minSize)
                    }
                    10 -> { // New drag
                        cropRect.right = x.coerceAtLeast(cropRect.left + minSize)
                        cropRect.bottom = y.coerceAtLeast(cropRect.top + minSize)
                    }
                }
                invalidate()
                return true
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                touchMode = 0
                invalidate()
                return true
            }
        }
        return super.onTouchEvent(event)
    }

    private fun getHandleAt(x: Float, y: Float): Int {
        val midX = cropRect.centerX()
        val midY = cropRect.centerY()
        val r = handleRadius

        if (dist(x, y, cropRect.left, cropRect.top) < r) return 2
        if (dist(x, y, midX, cropRect.top) < r) return 3
        if (dist(x, y, cropRect.right, cropRect.top) < r) return 4
        if (dist(x, y, cropRect.right, midY) < r) return 5
        if (dist(x, y, cropRect.right, cropRect.bottom) < r) return 6
        if (dist(x, y, midX, cropRect.bottom) < r) return 7
        if (dist(x, y, cropRect.left, cropRect.bottom) < r) return 8
        if (dist(x, y, cropRect.left, midY) < r) return 9
        return 0
    }

    private fun dist(x1: Float, y1: Float, x2: Float, y2: Float): Float {
        val dx = x1 - x2
        val dy = y1 - y2
        return sqrt((dx * dx + dy * dy).toDouble()).toFloat()
    }
}

class FloatingBubbleService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingView: RelativeLayout? = null
    private var cropOverlayView: CropOverlayView? = null
    private var params: WindowManager.LayoutParams? = null
    private var overlayParams: WindowManager.LayoutParams? = null

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
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            data = Uri.parse("snapshot://capture")
            putExtra("route", "/capture")
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent ?: Intent(),
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
        showSelectionOverlay()
    }

    private fun showSelectionOverlay() {
        if (windowManager == null) return

        floatingView?.visibility = View.GONE

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        overlayParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        )

        cropOverlayView = CropOverlayView(
            this,
            onCapture = { rect ->
                hideSelectionOverlay()
                onAreaCaptured(rect)
            },
            onCancel = {
                hideSelectionOverlay()
            }
        )

        try {
            windowManager?.addView(cropOverlayView, overlayParams)
        } catch (e: Exception) {
            e.printStackTrace()
            floatingView?.visibility = View.VISIBLE
        }
    }

    private fun hideSelectionOverlay() {
        if (cropOverlayView != null) {
            try {
                windowManager?.removeView(cropOverlayView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            cropOverlayView = null
        }
        floatingView?.visibility = View.VISIBLE
    }

    private fun onAreaCaptured(rect: RectF) {
        try {
            FloatingBubbleModule.sendEvent("onFloatingBubbleClicked")

            val uri = Uri.parse("snapshot://capture?cropX=\${rect.left.toInt()}&cropY=\${rect.top.toInt()}&cropW=\${rect.width().toInt()}&cropH=\${rect.height().toInt()}")
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                setPackage(packageName)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        hideSelectionOverlay()
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
import com.facebook.react.modules.core.DeviceEventManagerModule

class FloatingBubbleModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        var sharedReactContext: ReactApplicationContext? = null

        fun sendEvent(eventName: String) {
            try {
                sharedReactContext
                    ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit(eventName, null)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    init {
        sharedReactContext = reactContext
    }

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
