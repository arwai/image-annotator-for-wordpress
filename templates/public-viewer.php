<?php
/**
 * Public viewer template
 *
 * @var string $container_id
 * @var string $first_image_url
 * @var array  $image_ids
 */
?>
<div id='arwai-annotation-show-hide-buttons'>
    <button id='arwai-toggle-annotations' class='arwai-simple-toggle' title='Hide Annotations'>
        <span data-feather='eye'>Show Annotations</span>
        <span data-feather='eye-off' style='display:none;'>Hide Annotations</span>
    </button>
</div>
<div id='mainViewerID'>
    <div id='sidebarNav'>
        <button id='sidebarOpenButton' class='sidebar-nav-button' onclick='openNav()'>☰  Annotations</button>
        <button id='sidebarCloseButton' class='sidebar-nav-button' onclick='closeNav()' style='display: none;'>×  Close Sidebar</button>
    </div>

    <div id='<?php echo esc_attr( $container_id ); ?>' class='arwai-simple-viewer'>

        <div class='arwai-simple-viewer-main'>
            <img src='<?php echo esc_url( $first_image_url ); ?>' alt='Annotatable Image'>
            <div class='arwai-simple-viewer-nav'>
                <button class='arwai-simple-prev'><span data-feather='arrow-left'></span></button>
                <span class='arwai-simple-counter'><span class='arwai-simple-current-index'>1</span> / <?php echo count( $image_ids ); ?></span>
                <button class='arwai-simple-next'><span data-feather='arrow-right'></span></button>
            </div>
        </div>
        <div class='arwai-simple-viewer-strip-container'>
            <button class='arwai-simple-strip-scroll-left'>
                <span data-feather='chevron-left'></span>
            </button>
            <div id='arwai-simple-viewer-reference-strip'>
                <?php foreach ( $image_ids as $index => $id ) : ?>
                    <?php $thumb_url = wp_get_attachment_image_url( $id, 'thumbnail' ); ?>
                    <img src='<?php echo esc_url( $thumb_url ); ?>' class='arwai-simple-thumb' data-index='<?php echo esc_attr( $index ); ?>'>
                <?php endforeach; ?>
            </div>
            <button class='arwai-simple-strip-scroll-right'>
                <span data-feather='chevron-right'></span>
            </button>
        </div>

    </div>
</div>

<div id='arwai-annotation-list-container' class='sidebar'>
    <h3>Annotations</h3>
    <ul id='arwai-annotation-list'></ul>
</div>
