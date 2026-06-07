---
name: import-blog-image
description: Import and optimize a source image into the blog assets directory, generating responsive JPG variants following the project's naming convention. Use when adding a new blog post image or thumbnail.
---

# Import Blog Image

You are an expert at optimizing images for a Jekyll/Hydejack static site. When the user provides a source image for a blog post, follow these steps to generate responsive JPG variants and save them to the correct location.

## 1. Image Size Conventions

The Hydejack theme expects responsive image variants named with the following suffixes:

| Suffix   | Scale | Example width (from 1640px source) |
| :------- | :---- | :--------------------------------- |
| (none)   | 100%  | 1640px (full size)                 |
| `@0,5x`  | 50%   | 820px                              |
| `@0,25x` | 25%   | 410px                              |

> Note: The comma (`,`) in `@0,5x` and `@0,25x` is intentional — it is the project convention, not a typo.

## 2. Output Naming Convention

Given a source image named `my-cool-post.png`, the outputs should be:

```
assets/img/blog/my-cool-post.jpg         ← full size
assets/img/blog/my-cool-post@0,5x.jpg   ← 50% width
assets/img/blog/my-cool-post@0,25x.jpg  ← 25% width
```

The base name (without extension) is derived from the source filename unless the user specifies a different name.

## 3. Conversion Tool & Quality

Use `ffmpeg` for PNG → JPG conversion with the following quality settings:

```bash
# Full size (100%)
ffmpeg -i <source> -vf "scale=<W>:-1" -q:v 2 <output>.jpg

# Half size (50%)
ffmpeg -i <source> -vf "scale=<W/2>:-1" -q:v 3 <output>@0,5x.jpg

# Quarter size (25%)
ffmpeg -i <source> -vf "scale=<W/4>:-1" -q:v 4 <output>@0,25x.jpg
```

- `-q:v 2` = highest quality JPG (scale 1–31; lower = better)
- `-q:v 3` = high quality for half-size
- `-q:v 4` = good quality for quarter-size
- Always use `-vf "scale=W:-1"` so height is computed automatically (preserves aspect ratio)
- Round the target width to the nearest even integer (ffmpeg requires even dimensions)

## 4. Target Directory

Always save to:
```
/Users/jyje/repo/jyje/profile/assets/img/blog/
```

## 5. Post Front Matter Reference

After generating the images, provide the user with a ready-to-paste front matter snippet using the srcset object format:

```yaml
image:
  path: /assets/img/blog/<name>.jpg
  srcset:
    1640w: /assets/img/blog/<name>.jpg
    820w:  /assets/img/blog/<name>@0,5x.jpg
    410w:  /assets/img/blog/<name>@0,25x.jpg
```

Replace `1640`, `820`, `410` with the actual widths of the generated images.

## 6. Workflow

1. Confirm the source image path and the desired output base name with the user if unclear.
2. Determine source image dimensions using `file` or `sips -g pixelWidth`.
3. Compute target widths (100%, 50%, 25%), rounded to even integers.
4. Run `ffmpeg` three times to generate the three variants.
5. Verify each output file exists and report the file sizes.
6. Print the ready-to-paste front matter snippet.
