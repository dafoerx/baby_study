package com.babystudy.flashcard;

import android.app.Activity;
import android.app.UiModeManager;
import android.content.Context;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * 安宝闪卡主 Activity
 * 使用 WebView 加载本地 HTML 应用
 * 适配手机 + 华为智慧屏 V75 (Android TV)
 */
public class MainActivity extends Activity {

    private WebView webView;
    private boolean isTVMode = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 检测是否是TV模式
        isTVMode = detectTVMode();

        // 全屏沉浸式
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setupFullScreen();

        // 创建 WebView
        webView = new WebView(this);
        setContentView(webView);

        // 配置 WebView
        configureWebView();

        // 加载本地页面
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    /**
     * 检测是否运行在TV/智慧屏上
     */
    private boolean detectTVMode() {
        UiModeManager uiModeManager = (UiModeManager) getSystemService(Context.UI_MODE_SERVICE);
        if (uiModeManager != null && uiModeManager.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION) {
            return true;
        }
        // 华为智慧屏可能不报告为TV模式，通过屏幕尺寸和横屏判断
        Configuration config = getResources().getConfiguration();
        int screenWidthDp = config.screenWidthDp;
        int screenHeightDp = config.screenHeightDp;
        return screenWidthDp >= 960 && config.orientation == Configuration.ORIENTATION_LANDSCAPE;
    }

    private void setupFullScreen() {
        Window window = getWindow();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#E53935"));
        }

        // 保持屏幕常亮（闪卡播放时需要）
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // TV模式：完全全屏沉浸
        if (isTVMode || Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();

        // 启用 JavaScript
        settings.setJavaScriptEnabled(true);

        // DOM 存储（localStorage）
        settings.setDomStorageEnabled(true);

        // 缩放控制
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // 视口适配
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);

        // 文件访问
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // 缓存
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // TV模式优化
        if (isTVMode) {
            // TV大屏不需要桌面模式切换
            settings.setUserAgentString(settings.getUserAgentString() + " HuaweiSmartScreen/TV");
            // 禁用长按（TV遥控器不需要）
            webView.setLongClickable(false);
            webView.setHapticFeedbackEnabled(false);
        }

        // 确保链接在 WebView 内打开
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        // 背景色与应用一致
        webView.setBackgroundColor(Color.parseColor("#FFF8F0"));

        // 启用焦点（TV遥控器导航必须）
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.requestFocus();
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // 将方向键和确认键传递给WebView处理
        if (webView != null && event.getAction() == KeyEvent.ACTION_DOWN) {
            int keyCode = event.getKeyCode();
            switch (keyCode) {
                case KeyEvent.KEYCODE_DPAD_UP:
                case KeyEvent.KEYCODE_DPAD_DOWN:
                case KeyEvent.KEYCODE_DPAD_LEFT:
                case KeyEvent.KEYCODE_DPAD_RIGHT:
                case KeyEvent.KEYCODE_DPAD_CENTER:
                case KeyEvent.KEYCODE_ENTER:
                case KeyEvent.KEYCODE_MENU:
                    // 让WebView的JavaScript处理这些按键
                    return webView.dispatchKeyEvent(event);
            }
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            // 先让JS处理返回
            webView.evaluateJavascript(
                "(function() {" +
                "  var backBtn = document.querySelector('.page.active .btn-back');" +
                "  if (backBtn) { backBtn.click(); return 'handled'; }" +
                "  var modal = document.querySelector('.modal:not(.hidden)');" +
                "  if (modal) { modal.querySelector('.btn-close').click(); return 'handled'; }" +
                "  return 'not_handled';" +
                "})()",
                value -> {
                    if (value != null && value.contains("not_handled")) {
                        runOnUiThread(() -> MainActivity.super.onBackPressed());
                    }
                }
            );
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // 重新进入时恢复全屏
        if (hasFocus && (isTVMode || Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT)) {
            setupFullScreen();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
