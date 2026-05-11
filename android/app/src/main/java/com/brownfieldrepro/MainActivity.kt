package com.brownfieldrepro

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler

class MainActivity : AppCompatActivity(), DefaultHardwareBackBtnHandler {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    if (savedInstanceState == null) {
      supportFragmentManager
        .beginTransaction()
        .replace(R.id.rn_container, RNFragment())
        .commitNow()
    }
  }

  // ReactDelegate calls this when JS yields back-press control to native.
  override fun invokeDefaultOnBackPressed() {
    onBackPressedDispatcher.onBackPressed()
  }
}
