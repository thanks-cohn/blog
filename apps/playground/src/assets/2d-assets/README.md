# 2D asset discovery

Drop image assets here using:

```text
<artworkName>-<number>.<ext>
```

Examples:

```text
first-light-1.png
first-light-2.webp
blue-room-1.jpg
```

Supported extensions: PNG, JPG/JPEG, WEBP, AVIF, SVG.

A station whose `artworkName` is `first-light` automatically owns all matching
`first-light-<number>.*` images.

2D assets are billboarded by default: they remain visually facing the viewer
while occupying a 3D position inside the station's influence sphere.

Automatic placement keeps them outside the protected image + paper viewport.
Manual editing may override that rule later.
