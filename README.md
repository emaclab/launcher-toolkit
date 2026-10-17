# launcher-toolkit

Release-only repository. The core repository `emaclab/launcher-global` creates every release
`vX.Y.Z` from a version tag. There is no source code here and no workflow.

## Release assets

| Asset | Use |
| --- | --- |
| `launcher-core-vX.Y.Z-windows-x64.exe` | The generic launcher core, before `stamp` |
| `launcher-publish-vX.Y.Z-windows-x64.exe`, `launcher-publish-vX.Y.Z-linux-x64` | Pack build, validation, stamp, installer and publish tool |
| `pack-studio-vX.Y.Z-windows-x64.exe` | Pack studio for designers: live preview, state simulator, checks |
| `tailwindcss-windows-x64.exe` | Tailwind CLI v4.3.3; keep it next to `pack-studio.exe` |
| `SHA256SUMS` | SHA-256 of every asset |

Check the SHA-256 of each download against `SHA256SUMS`. No asset contains a secret: signing
and publishing need keys that only the vendor's publisher repository holds.

## Third-party notice

`tailwindcss-windows-x64.exe` is the standalone Tailwind CSS CLI, redistributed unmodified from
<https://github.com/tailwindlabs/tailwindcss/releases> under the MIT License:

```
MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
