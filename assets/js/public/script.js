// DEBUG: This log should appear as soon as the file is loaded by the browser.
console.log('File loaded: script.js');

/**
 * A formatter to display the annotation ID label.
 */
const arwaiIdFormatter = function(annotation) {
  // DEBUG: This log confirms that Annotorious is calling the formatter fpr annotationid
  console.log('arwaiIdFormatter was called for annotation:', annotation);

  const idBody = annotation.body.find(b => b.purpose === 'arwai-AnnotationID');
  if (idBody) {
    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
        foreignObject.innerHTML =
        `<label xmlns="http://www.w3.org/1999/xhtml" >${idBody.value}</label>`;
    return {
      element: foreignObject
    };
  }
  return null;
}





/**
 * A single, combined formatter to handle annotation styling.
 */
const arwaiStyleFormatter = function(annotation) {
    // DEBUG: Log to confirm the style formatter is running.
    console.log('arwaiStyleFormatter was called.');

    const isImportant = annotation.body.find(b =>
        b.purpose === 'tagging' && (b.value.toLowerCase() === 'important' || b.value.toLowerCase() === 'importante')
    );
    if (isImportant) return { className: 'important' };

    const hasTags = annotation.body.find(b => b.purpose === 'tagging');
    if (hasTags) return { className: 'tagged' };

    return null;
};



function openNav() {
  document.getElementById('arwai-annotation-list-container').style.width = '350px';
  document.getElementById('mainViewerID').style.marginRight = '350px';
  document.getElementById('sidebarOpenButton').style.display = 'none';
  document.getElementById('sidebarCloseButton').style.display = 'inline-block'; // Or 'block'
}

function closeNav() {
  document.getElementById('arwai-annotation-list-container').style.width = '0';
  document.getElementById('mainViewerID').style.marginRight = '0';
  document.getElementById('sidebarOpenButton').style.display = 'inline-block'; // Or 'block'
  document.getElementById('sidebarCloseButton').style.display = 'none';
}





jQuery(document).ready(function($) {
    // DEBUG: This confirms that jQuery is ready and the main script logic is starting.
    console.log('Document ready. Starting simple viewer initialization.');

    // Note: The localized script name is now Arwai_Annotator_Data
    if (typeof Arwai_Annotator_Data === 'undefined') {
        // DEBUG: This will show if the data from PHP is missing.
        console.error('Arwai_Annotator_Data is not defined. Check wp_localize_script in PHP.');
        return;
    }

    const {
        containerId,
        images,
        ajax_url,
        anno_options
    } = Arwai_Annotator_Data;
    const container = $('#' + containerId);

    if (!container.length || images.length === 0) {
        return;
    }

    const mainImage = container.find('.arwai-simple-viewer-main img');
    const prevButton = container.find('.arwai-simple-prev');
    const nextButton = container.find('.arwai-simple-next');
    const thumbnails = container.find('.arwai-simple-thumb');
    const currentIndexSpan = container.find('.arwai-simple-current-index');
    const strip = container.find('#arwai-simple-viewer-reference-strip');
    const scrollLeftButton = container.find('.arwai-simple-strip-scroll-left');
    const scrollRightButton = container.find('.arwai-simple-strip-scroll-right');
    const listContainer = $('#arwai-annotation-list');
    const toggleButton = $('#arwai-toggle-annotations');
    let annotationsVisible = true;

    toggleButton.on('click', function() {
        annotationsVisible = !annotationsVisible; // Flip the state

        if (anno) {
            anno.setVisible(annotationsVisible); // Show or hide annotations
        }

        if (annotationsVisible) {
            $(this).find('[data-feather="eye"]').show();
            $(this).find('[data-feather="eye-off"]').hide();
            $(this).attr('title', 'Hide Annotations');
        } else {
            $(this).find('[data-feather="eye"]').hide();
            $(this).find('[data-feather="eye-off"]').show();
            $(this).attr('title', 'Show Annotations');
        }
    });

    let currentIndex = 0;
    let anno = null;

    function convertAnnotationToPixel(annotation, imageWidth, imageHeight) {
        const newA = JSON.parse(JSON.stringify(annotation));
        if (newA.target.selector.value && newA.target.selector.value.startsWith('xywh=percent:')) {
            const coords = newA.target.selector.value.substring(13).split(',');
            const percent = { x: parseFloat(coords[0]), y: parseFloat(coords[1]), w: parseFloat(coords[2]), h: parseFloat(coords[3]) };
            const px = { x: (percent.x / 100) * imageWidth, y: (percent.y / 100) * imageHeight, w: (percent.w / 100) * imageWidth, h: (percent.h / 100) * imageHeight };
            newA.target.selector.value = `xywh=pixel:${px.x},${px.y},${px.w},${px.h}`;
        }
        return newA;
    }

    function convertAnnotationToPercent(annotation, imageWidth, imageHeight) {
        const newA = JSON.parse(JSON.stringify(annotation));
         if (newA.target.selector.value && newA.target.selector.value.startsWith('xywh=pixel:')) {
            const coords = newA.target.selector.value.substring(11).split(',');
            const px = { x: parseFloat(coords[0]), y: parseFloat(coords[1]), w: parseFloat(coords[2]), h: parseFloat(coords[3]) };
            const percent = { x: (px.x / imageWidth) * 100, y: (px.y / imageHeight) * 100, w: (px.w / imageWidth) * 100, h: (px.h / imageHeight) * 100 };
            newA.target.selector.value = `xywh=percent:${percent.x},${percent.y},${percent.w},${percent.h}`;
        }
        return newA;
    }

    function initAnnotorious() {
        if (anno) {
            anno.destroy();
            anno = null;
        }

        const annoConfig = {
            image: mainImage[0],
            formatters: [arwaiIdFormatter, arwaiStyleFormatter],
            readOnly: anno_options.readOnly || (anno_options.currentUser === null),
            allowEmpty: anno_options.allowEmpty,
            drawOnSingleClick: anno_options.drawOnSingleClick,
            widgets: ['COMMENT', { widget: 'TAG', vocabulary: anno_options.tagVocabulary || [] }]
        };

        console.log('Initializing Annotorious with config:', annoConfig);

        try {
            // Using Annotorious.init() as requested by the new script's logic
            anno = Annotorious.init(annoConfig);
            console.log('Annotorious initialized successfully.');
        } catch (e) {
            console.error('Error during Annotorious.init():', e);
            return;
        }

        if (anno_options.currentUser) {
            anno.setAuthInfo({ id: anno_options.currentUser.id, displayName: anno_options.currentUser.displayName });
        }

        anno.on('createAnnotation', function(annotation) {
            const imageEl = mainImage[0];
            const percentAnnotation = convertAnnotationToPercent(annotation, imageEl.naturalWidth, imageEl.naturalHeight);
            percentAnnotation.target.source = images[currentIndex].url;
            $.post(ajax_url, { action: 'arwai_anno_add', annotation: JSON.stringify(percentAnnotation), nonce: anno_options.annoNonce })
                .done(function(response) {
                    if (response.success && response.data.annotation) {
                        anno.removeAnnotation(annotation);
                        const pixelAnnotation = convertAnnotationToPixel(response.data.annotation, imageEl.naturalWidth, imageEl.naturalHeight);
                        anno.addAnnotation(pixelAnnotation);
                        updateAnnotationList();
                    }
                });
        });

        anno.on('updateAnnotation', function(annotation) {
            const imageEl = mainImage[0];
            const percentAnnotation = convertAnnotationToPercent(annotation, imageEl.naturalWidth, imageEl.naturalHeight);
            percentAnnotation.target.source = images[currentIndex].url;
            $.post(ajax_url, { action: 'arwai_anno_update', annotation: JSON.stringify(percentAnnotation), annotationid: percentAnnotation.id, nonce: anno_options.annoNonce });
            updateAnnotationList();
        });

        anno.on('deleteAnnotation', function(annotation) {
            annotation.target.source = images[currentIndex].url;
            $.post(ajax_url, { action: 'arwai_anno_delete', annotation: JSON.stringify(annotation), annotationid: annotation.id, nonce: anno_options.annoNonce });
            updateAnnotationList();
        });

        loadAnnotationsForImage(images[currentIndex].post_id);
    }

    function loadAnnotationsForImage(attachmentId) {
        if (!anno || !attachmentId) return;
        anno.setAnnotations([]);
        updateAnnotationList();
        const imageEl = mainImage[0];
        const imageWidth = imageEl.naturalWidth;
        const imageHeight = imageEl.naturalHeight;
        if (imageWidth === 0 || imageHeight === 0) {
            setTimeout(() => loadAnnotationsForImage(attachmentId), 100);
            return;
        }
        $.ajax({
            url: ajax_url,
            data: { action: 'arwai_anno_get', attachment_id: attachmentId },
            dataType: 'json',
            success: function(annotations) {
                if (Array.isArray(annotations)) {
                    const pixelAnnotations = annotations.map(a => convertAnnotationToPixel(a, imageWidth, imageHeight));
                    anno.setAnnotations(pixelAnnotations);
                    updateAnnotationList();
                }
            },
            error: function(xhr) { console.error("Error loading annotations:", xhr.responseText); }
        });
    }

    function updateAnnotationList() {
        if (!listContainer.length || !anno) return;
        listContainer.empty();
        const annotations = anno.getAnnotations();
        if (annotations.length === 0) {
            listContainer.html('<li>No annotations for this image.</li>');
            return;
        }
        const tagLinks = anno_options.tagLinks || {};
        annotations.forEach(annotation => {
            const idBody = annotation.body.find(b => b.purpose === 'arwai-AnnotationID');
            const annotationId = idBody ? idBody.value : 'N/A';
            const tagBodies = annotation.body.filter(b => b.purpose === 'tagging');
            const tagsHtml = tagBodies.length > 0 ? tagBodies.map(body => {
                const tagName = body.value;
                return tagLinks[tagName] ? `<button class="arwai-anno-list-tag"><a href="${tagLinks[tagName]}" class="arwai-anno-list-tag-link">${tagName}</a></button>` : `<span class="arwai-anno-list-tag">${tagName}</span>`;
            }).join(' ') : '<em>n/a</em>';
            const commentBodies = annotation.body.filter(b => b.purpose === 'commenting' || b.purpose === 'replying');
            let commentsHtml = '<p><em>No comments yet.</em></p>';
            if (commentBodies.length > 0) {
                commentsHtml = '<ul class="arwai-anno-list-comments">';
                commentBodies.forEach(body => {
                    const creator = body.creator || annotation.creator;
                    const creatorName = creator ? (creator.name || creator.displayName) : 'Unknown';
                    const dateValue = body.created || annotation.created;
                    const createdDate = dateValue ? new Date(dateValue).toLocaleString() : 'N/A';
                    const commentText = body.value || '<em>Empty comment</em>';
                    commentsHtml += `<li class="arwai-anno-list-comment-item"><p>${commentText}</p><div class="arwai-anno-list-comment-meta"><strong>By:</strong> ${creatorName} <strong>on:</strong> ${createdDate}</div></li>`;
                });
                commentsHtml += '</ul>';
            }
            const listItem = `
            <li>
                <div class="arwai-anno-list-item">
                    <div class="arwai-anno-list-header"><span> ${annotationId}</span>
                    </div>
                    <div>
                        <div class="arwai-anno-list-body">${commentsHtml}
                        </div>
                        <div class="arwai-anno-list-footer"><strong>Tags:</strong> ${tagsHtml}
                        </div>
                    </div>
                </div>
            </li>`;
            listContainer.append(listItem);
        });
    }

    function updateArrowVisibility() {
        if (!strip.length || !scrollLeftButton.length || !scrollRightButton.length) return;
        const canScroll = strip[0].scrollWidth > strip[0].clientWidth;
        scrollLeftButton.toggle(canScroll);
        scrollRightButton.toggle(canScroll);
    }

    function updateView(index) {
        if (index < 0 || index >= images.length) return;
        currentIndex = index;
        mainImage.off('load').one('load', initAnnotorious);
        mainImage.attr('src', images[currentIndex].url);
        if (mainImage[0].complete) {
            mainImage.trigger('load');
        }
        currentIndexSpan.text(currentIndex + 1);
        thumbnails.removeClass('active').eq(currentIndex).addClass('active');
        const activeThumb = thumbnails.eq(currentIndex);
        if (activeThumb.length && strip.length) {
            const stripScrollLeft = strip.scrollLeft();
            const thumbOffsetLeft = activeThumb.position().left;
            const thumbWidth = activeThumb.outerWidth();
            const stripVisibleWidth = strip.width();
            if (thumbOffsetLeft < 0) {
                strip.animate({ scrollLeft: stripScrollLeft + thumbOffsetLeft - 10 }, 300);
            } else if (thumbOffsetLeft + thumbWidth > stripVisibleWidth) {
                strip.animate({ scrollLeft: stripScrollLeft + (thumbOffsetLeft + thumbWidth - stripVisibleWidth) + 10 }, 300);
            }
        }
    }

    prevButton.on('click', () => updateView((currentIndex - 1 + images.length) % images.length));
    nextButton.on('click', () => updateView((currentIndex + 1) % images.length));
    thumbnails.on('click', function() { updateView($(this).data('index')); });
    scrollLeftButton.on('click', () => strip.animate({ scrollLeft: '-=200' }, 300));
    scrollRightButton.on('click', () => strip.animate({ scrollLeft: '+=200' }, 300));

    if (strip.length) {
        let isDragging = false, startX, scrollLeft;
        strip.css('cursor', 'grab').on('mousedown', function(e) {
            isDragging = true;
            strip.css('cursor', 'grabbing');
            startX = e.pageX - strip.offset().left;
            scrollLeft = strip.scrollLeft();
        }).on('mouseleave mouseup', function() {
            isDragging = false;
            strip.css('cursor', 'grab');
        }).on('mousemove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
            strip.scrollLeft(scrollLeft - (e.pageX - strip.offset().left - startX));
        });
    }

    updateView(0);
    updateArrowVisibility();
    $(window).on('resize', updateArrowVisibility);

    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});