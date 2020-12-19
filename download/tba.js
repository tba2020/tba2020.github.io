jQuery(function($) {
  const is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hide_mobile_share_button = function(){
    if($('.at-share-btn').length) {
      // hide addthis mobile buttons on pc
      if(is_mobile){
        // true for mobile device
        $('.at-share-btn.at-svc-kakaotalk, .at-share-btn.at-svc-sms').show();
        $('.at-share-btn.at-svc-kakao').hide();
      } else {
        // false for not mobile device
        $('.at-share-btn.at-svc-kakaotalk, .at-share-btn.at-svc-sms').hide();
        $('.at-share-btn.at-svc-kakao').show();
      }
    } else {
      setTimeout(hide_mobile_share_button,100);
    }
  };
  setTimeout(hide_mobile_share_button,300);
})