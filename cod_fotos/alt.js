// JavaScript Document
var timerId = null;

function prepareShowAlt(event) {
  if (!event.element()._title) {
    return false;
  }

  var altDiv = $('altDiv');
  altDiv.style.left = Math.min(event.pointerX() + 10, $(document.body).getWidth() - 202) + 'px';
  altDiv.style.top = event.pointerY() + 'px';
  altDiv.innerHTML = event.element()._title;
  if (this._title.length > 30) {
    altDiv.style.width = 200 + 'px';
  } else {
    altDiv.style.width = '';
  }

  timerId = setTimeout(altDiv.show.bind(altDiv), 500);
}

function hideAlt(event) {
  clearTimeout(timerId);
  var altDiv = $('altDiv');
  altDiv.hide();
  altDiv.innerHTML = '';
  altDiv.style.left = -100 + 'px';
  altDiv.style.top = -100 + 'px';
}

function initAlts() {
  $A(document.getElementsByClassName('altTitle')).each(function(item) {
    if (item.title.length > 0) {
      if (item.title.slice(0,1) == '#') {
        item._title = $(item.title.slice(1)).innerHTML;
      } else {
        item._title = '<p>' + item.title + '</p>';
      }

      item.title = '';
      $(item).observe('mouseover', prepareShowAlt);
      $(item).observe('mouseout', hideAlt);
    }
  });
}