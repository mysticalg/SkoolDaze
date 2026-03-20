package io.mysticalg.bellboundacademy;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureWebViewPresentation();
    }

    @Override
    public void onResume() {
        super.onResume();
        configureWebViewPresentation();
    }

    private void configureWebViewPresentation() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        webView.setBackgroundColor(Color.BLACK);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // Some Android emulators fail to present the accelerated WebView surface for large
        // canvas-heavy pages even though the renderer is alive. Software compositing keeps
        // Bellbound visible there while leaving real devices on the faster default path.
        if (shouldForceSoftwareLayer()) {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        } else {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
    }

    private boolean shouldForceSoftwareLayer() {
        return Build.FINGERPRINT.contains("generic")
            || Build.FINGERPRINT.contains("emulator")
            || Build.HARDWARE.contains("ranchu")
            || Build.HARDWARE.contains("goldfish")
            || Build.MODEL.contains("Emulator")
            || Build.PRODUCT.contains("sdk");
    }
}
