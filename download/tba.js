jQuery(function($) {
  const is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  setTimeout(function(){
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
  },1000);
})