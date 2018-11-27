// JavaScript Document
var TemplatePreview = Class.create({
  initialize: function(thumbnailImg, previewOptions) {
    this.thumbnailImg = $(thumbnailImg);
    this.previewOptions = previewOptions || {};

    this.thumbnailImg.observe('mouseover', this.onMouseOver.bindAsEventListener(this));
    this.thumbnailImg.observe('mouseout', this.onMouseOut.bindAsEventListener(this));

    // Cache the bound onMouseMove handler for Event.stopObserving method
    this.onMouseMoveHandler = function(event) {
      PreviewWindow.getInstance().followMouse(event.pointerX(), event.pointerY());
    }.bindAsEventListener(this);
  },

  onMouseOver: function(event) {
    this.thumbnailImg.observe('mousemove', this.onMouseMoveHandler);
    PreviewWindow.getInstance().show(event.pointerX(), event.pointerY(), this.previewOptions);
  },

  onMouseOut: function(event) {
    this.thumbnailImg.stopObserving('mousemove', this.onMouseMoveHandler);
    PreviewWindow.getInstance().hide();
  }
});


var PreviewWindow = Class.create({
  initialize: function() {
    this.windowElement = new Element('div', {id:'tplPreview', style:'display:none; position:absolute;'});
    this.titleElement = new Element('h2', {id:'tplPreviewTitle'});
    this.imageElement = new Element('img', {id:'tplPreviewImage'});
    this.progressBarElement = new Element('div', {id:'tplPreviewProgressBar', style:'display:none;'});

    this.windowElement.insert(
      this.titleElement
    ).insert(
      new Element('div', {id:'tplPreviewBody'}).insert(
        this.imageElement
      ).insert(
        this.progressBarElement.update('Cargando muestra web...')
      )
    );

    document.body.insert(this.windowElement);
  },

  loadPreview: function(options) {
    this.titleElement.update(options.title);

    var oldImg = this.imageElement;
    this.imageElement = new Element('img', {
      id: 'tplPreviewImage',
      src: options.src,
      width: options.width,
      height: options.height
    });
    oldImg.replace(this.imageElement);

    if (!this.imageElement.complete) {
      this.progressBarElement.show();
      this.imageElement.observe('load', function(event) {
        this.progressBarElement.hide();
      }.bindAsEventListener(this));
    }

    // Refresh this.width, this.height
    Object.extend(this, this.windowElement.getDimensions());
  },

  show: function(x, y, options) {
    var viewport = document.viewport.getDimensions();
    if (viewport.width < 600 || viewport.height < 450) {
      return;
    }

    if (typeof options == 'object') {
      this.loadPreview(options);
    }

    this.followMouse(x, y);

    this.timerId = function() {
      if (this.imageElement.src.length > 0) {
        this.windowElement.show();
      }
    }.bind(this).delay(0.25);
  },

  hide: function() {
    window.clearTimeout(this.timerId);
    this.windowElement.hide();
    this.windowElement.setStyle({
      top: '-' + this.height + 'px',
      left: '-' +  this.width + 'px'
    });
  },

  followMouse: function(mouseX, mouseY) {
    var x = 0, y = 0;
    var mouseOffset = 24;
    var mouseXpos = '', mouseYpos = '';

    var viewport = Object.extend(
      document.viewport.getDimensions(),
      document.viewport.getScrollOffsets()
    );
    mouseX -= viewport.left;
    mouseY -= viewport.top;

    if (mouseY + mouseOffset < (viewport.height - this.height) / 2) {
      mouseYPos = 'top';
      y = mouseY + mouseOffset;
    } else if (mouseY - mouseOffset > (viewport.height + this.height) / 2) {
      mouseYPos = 'bottom';
      y = mouseY - mouseOffset - this.height;
    } else {
      mouseYPos = 'middle';
      y = (viewport.height - this.height) / 2;
    }

    if (mouseYPos != 'middle'
        && ((mouseX + mouseOffset > (viewport.width - this.width) / 2)
         && (mouseX - mouseOffset < (viewport.width + this.width) / 2))) {
      mouseXPos = 'center';
      x = (viewport.width - this.width) / 2;
    } else if (mouseX > viewport.width / 2) {
      mouseXPos = 'right';
      x = mouseX - mouseOffset - this.width;
    } else {
      mouseXPos = 'left';
      x = mouseX + mouseOffset;
    }

    this.windowElement.setStyle({
      top: y + viewport.top + 'px',
      left: x + viewport.left + 'px'
    });
  }
});

PreviewWindow.getInstance = function() {
  if (PreviewWindow.instance == null) {
    PreviewWindow.instance = new PreviewWindow();
  }
  return PreviewWindow.instance;
}