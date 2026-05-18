# Image Annotator for WordPress

**Image Annotator for WordPress** is a powerful plugin that integrates the [Annotorious](https://annotorious.github.io/) library into your WordPress site, allowing users to create, manage, and view annotations on images.

## Features

- **Annotorious Integration:** Seamlessly annotate images with rectangles, comments, and tags.
- **Image Collection Metabox:** Easily select multiple images for a post and reorder them using a drag-and-drop interface.
- **Annotation Sidebar:** View a list of all annotations for the current image in a dedicated sidebar.
- **History Tracking:** Automatically records every creation, update, and deletion of an annotation, including the user and a snapshot of the data.
- **Taxonomy Syncing:** Optionally link Annotorious tags to existing WordPress taxonomies (e.g., Tags, Categories) for better organization and SEO.
- **Custom Database Tables:** Uses dedicated tables (`annotorious_data` and `annotorious_history`) for efficient storage and retrieval of annotation data.
- **Flexible Settings:** Configure active post types, default viewer modes, and Annotorious behaviors (read-only, allow empty, draw on single click) from a global settings page.
- **Featured Image Integration:** Option to automatically set the first image of a collection as the post's featured image.

## Installation

1. Upload the `image-annotator-for-wordpress` folder to your `/wp-content/plugins/` directory.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Upon activation, the plugin will automatically create the necessary database tables.

## Usage

### Configuration
1. Navigate to **ARWAI Annotator** in your WordPress admin menu.
2. Select the post types where you want to enable image annotations.
3. Configure global settings such as the default viewer mode and Annotorious behavior.
4. (Optional) Select a WordPress taxonomy to link with Annotorious tags.

### Adding Annotations
1. Open a post or page of an enabled post type.
2. Use the **Image Collection** metabox to add images. You can drag and drop images to change their display order.
3. Ensure the **Viewer Mode** is set to "Default Viewer" (or use the Gutenberg block if preferred).
4. Save or publish the post.
5. On the frontend, click and drag on the image to create a new annotation. Use the sidebar to see all existing annotations.

## Requirements

- WordPress 5.0 or higher.
- PHP 7.4 or higher.

## Credits

This plugin uses:
- [Annotorious](https://annotorious.github.io/) for image annotation functionality.
- [Feather Icons](https://feathericons.com/) for UI icons.

---
Created by [Arwai](https://arwai.me).
