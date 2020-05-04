//Raty.js function to show resraurant star rating 
$(document).ready(function(){
    $.fn.raty.defaults.path = '/images/';
    $('.star').raty({
        readOnly:true,
        score: function() {
          return $(this).attr('data-score');
        }
      });

      $('.helpful-btn').click(function(){
        $(this).remove();
        let id = $(this).attr('id')
        $(`.helpful-${id}`).append('<p class="text-success"><i class="fa fa-check"></i>  Thank you for your fedback.</p>')
;
      })
});

