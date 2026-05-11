package com.brownfieldrepro

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.facebook.react.ReactDelegate

/**
 * Hosts the React Native surface inside an Android Fragment — the brownfield
 * integration pattern. Mirrors the lifecycle that triggers the formSheet
 * invisibility bug: the host activity has already dispatched its window
 * insets by the time this fragment (and any modal fragments it later
 * presents) attach their insets listeners.
 */
class RNFragment : Fragment() {

  private lateinit var reactDelegate: ReactDelegate

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val reactHost = (requireActivity().applicationContext as MainApplication).reactHost
    reactDelegate = ReactDelegate(requireActivity(), reactHost, COMPONENT_NAME, null)
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?,
  ): View? {
    reactDelegate.loadApp(COMPONENT_NAME)
    return reactDelegate.reactRootView
  }

  override fun onResume() {
    super.onResume()
    reactDelegate.onHostResume()
  }

  override fun onPause() {
    reactDelegate.onHostPause()
    super.onPause()
  }

  override fun onDestroy() {
    reactDelegate.onHostDestroy()
    super.onDestroy()
  }

  companion object {
    private const val COMPONENT_NAME = "BrownfieldRepro"
  }
}
