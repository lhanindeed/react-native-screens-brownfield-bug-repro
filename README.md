# react-native-screens brownfield formSheet bug repro

Minimal reproduction for an Android Fabric brownfield bug in
[`react-native-screens`](https://github.com/software-mansion/react-native-screens)
where `formSheet` modals appear invisible on presentation.

## The bug

In a brownfield Android app on the New Architecture, the React Native surface
is hosted inside an Android `Fragment` that is added to an already-running
`Activity`. When a `formSheet` modal is presented from JS:

- the bottom sheet fragment is correctly sized and laid out behind the scenes,
  but
- it is **never made visible** until something forces a re-layout (e.g. lock
  + unlock the device, rotate, keyboard open).

Root cause: `BottomSheetTransitionCoordinator` (introduced in
[software-mansion/react-native-screens#3404](https://github.com/software-mansion/react-native-screens/pull/3404))
waits for both a layout callback and a window-insets callback before calling
`startPostponedEnterTransition()`. In brownfield the host activity's insets
have already been dispatched before the formSheet attaches its insets
listener, so `areInsetsApplied` never flips to `true` and the postponed
transition is stuck forever.

Pinned versions for the repro:

| | |
| --- | --- |
| React Native | `0.83.2` |
| react-native-screens | `4.24.0` |
| Architecture | Fabric (New Architecture) + Hermes |

## Why a stock RN init won't reproduce this

The default `npx react-native init` template makes `MainActivity` extend
`ReactActivity`. That's a greenfield setup — the RN surface IS the entire
activity, so its window-insets listener is attached before the activity has
finished its first inset dispatch and the
`BottomSheetTransitionCoordinator` receives the callback normally.

This repo deliberately diverges from the template:

- `MainActivity` is a plain `AppCompatActivity` that inflates
  [`activity_main.xml`](android/app/src/main/res/layout/activity_main.xml)
  and adds an `RNFragment` to a `FragmentContainerView`.
- [`RNFragment`](android/app/src/main/java/com/brownfieldrepro/RNFragment.kt)
  uses `ReactDelegate(activity, reactHost, appKey, null)` to host the React
  Native surface — the pattern used when integrating RN into an existing
  native Android app via a Fragment.
- `MainApplication` still implements `ReactApplication` and exposes the
  `reactHost`, but no activity extends `ReactActivity`.

## Prerequisites

- Node 22+
- JDK 17
- Android SDK with API 36 platform + build-tools 36.0.0 + NDK 27.1.12297006
- An Android emulator (Pixel API 34+) or device

## Run

```sh
pnpm install
pnpm start                # in one terminal — Metro
pnpm run android          # in another — installs + launches on the emulator/device
```

## Observe the bug

1. App opens to the **Brownfield Repro · Home** screen.
2. Tap **Present formSheet modal**.
3. **Expected (after fix):** the formSheet content slides up and is visible.
4. **Actual (current bug):** the screen dims as if a modal is in front, but
   the modal content is invisible. The "FormSheet" header title may render
   at the top of the screen but the sheet itself doesn't appear.
5. **Force a re-layout:** press the power button to lock the device, then
   unlock. The modal becomes visible. (Rotating the device or opening the
   keyboard also works.)

## Verify the proposed fix

A candidate fix is shipped on the [`proposed-fix`](../../tree/proposed-fix)
branch as a [`patch-package`](https://github.com/ds300/patch-package) overlay
at `patches/react-native-screens+4.24.0.patch`. To try it:

```sh
git checkout proposed-fix
pnpm install              # postinstall runs patch-package automatically
pnpm run android
```

Diff between the two branches:

```sh
git diff main..proposed-fix
```

In a greenfield app (the default RN template) the patch is a no-op — the
existing insets callback still fires and triggers the transition.

## Project layout

```
.
├── App.tsx                                  RN UI: Home + formSheet modal
├── index.js                                 Registers "BrownfieldRepro"
├── android/app/src/main/
│   ├── AndroidManifest.xml
│   ├── res/layout/activity_main.xml         FragmentContainerView host
│   └── java/com/brownfieldrepro/
│       ├── MainApplication.kt               ReactApplication + reactHost
│       ├── MainActivity.kt                  AppCompatActivity → adds RNFragment
│       └── RNFragment.kt                    ReactDelegate-backed Fragment
└── package.json
```
