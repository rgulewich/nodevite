
var swapActive = function() {
  // XXX: change this to not use post!
  var action = $(this);
  var url = window.location + '/reply/' + action.text().toLowerCase();

  $.post(url, function() {
    console.log("SUCCESS");

    var newLink = $('<a href="#" class="action">');
    var curSel  = $('.actionTaken');
    newLink.text(curSel.text());
    newLink.click(swapActive);
    curSel.replaceWith(newLink);

    var newSpan = $('<span class="actionTaken">');
    newSpan.text(action.text());
    action.replaceWith(newSpan);

    return false;
  });
  return false;
}

$(function() {
  console.log('loaded');
  $('.action').click(swapActive);
});
