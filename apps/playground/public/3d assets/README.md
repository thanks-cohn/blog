# 3d assets

This directory is the drop zone for optional 3D objects used by **Design it Your Way**.

Use the central artwork name as the filename prefix, followed by a differentiating
number:

```text
3d assets/
  first-light-1.glb
  first-light-2.glb
  first-light-3.glb
  blue-room-1.glb
  blue-room-2.glb
  rose-archive-1.glb
```

A station with `artworkName: "first-light"` owns every matching
`first-light-<number>.glb` asset.

The arrangement system places matching objects inside that station's influence
sphere, while automatic placement excludes the rectangular presentation viewport
formed by the artwork and its paper/text. That exclusion is a default generator
rule only. A future manual editor may deliberately move an object into the
viewport.

Arrangement modes:

- `random-every-visit`: new mathematical placement on each load.
- `seeded-once`: deterministic placement from the configured seed so the
  generated composition can be kept and refined.

The current lightweight canvas uses generated proxy solids when no GLB assets are
present. The naming and placement contract is ready for a later GLB loader.
