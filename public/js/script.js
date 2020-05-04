$(document).ready(function () {

  let rating = 0;

  $("#1_star").click(function () {
    $(this).attr('src', '/images/star_on.png');
    $("#2_star").attr('src', '/images/star_off.png');
    $("#3_star").attr('src', '/images/star_off.png');
    $("#4_star").attr('src', '/images/star_off.png');
    $("#5_star").attr('src', '/images/star_off.png');
    rating = 1;
  });

  $("#2_star").click(function () {
    $(this).attr('src', '/images/star_on.png');
    $("#1_star").attr('src', '/images/star_on.png');
    $("#3_star").attr('src', '/images/star_off.png');
    $("#4_star").attr('src', '/images/star_off.png');
    $("#5_star").attr('src', '/images/star_off.png');
    rating = 2;
  });

  $("#3_star").click(function () {
    $(this).attr('src', '/images/star_on.png');
    $("#1_star").attr('src', '/images/star_on.png');
    $("#2_star").attr('src', '/images/star_on.png');
    $("#4_star").attr('src', '/images/star_off.png');
    $("#5_star").attr('src', '/images/star_off.png');
    rating = 3;
  });

  $("#4_star").click(function () {
    $(this).attr('src', '/images/star_on.png');
    $("#1_star").attr('src', '/images/star_on.png');
    $("#2_star").attr('src', '/images/star_on.png');
    $("#3_star").attr('src', '/images/star_on.png');
    $("#5_star").attr('src', '/images/star_off.png');
    rating = 4;
  });

  $("#5_star").click(function () {
    $(this).attr('src', '/images/star_on.png');
    $("#1_star").attr('src', '/images/star_on.png');
    $("#2_star").attr('src', '/images/star_on.png');
    $("#3_star").attr('src', '/images/star_on.png');
    $("#4_star").attr('src', '/images/star_on.png');
    rating = 5;
  });

  $('#rate').click(function () {

    const form = $('#review-form')[0];
    console.log()
   

    let review = $('#review').val();
    let id = $('#id').val();
    let valid = true;

    if (rating === 0 || rating > 5) {
      $('#error_msg').html('Invalid rating').addClass('alert alert-danger text-center');
      valid = false;
    } else {
      $('#error_msg').html('').removeClass('alert alert-danger text-center');
    }

    if (valid === true) {

      var fileSelect = document.getElementById("review-form");
      var dataForm = $('[type="file"]')[0].files[0];
      let formData = new FormData();
      formData.append('image', dataForm);
      formData.append('review', review);
      formData.append('rating', rating);

      $.ajax({
        url: `/restaurant/review/${id}`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
          const redirect = `/restaurant/sort/${id}/recent`;
          setTimeout(function () {
            window.location.href = redirect;
          }, 900);
  
        }
      })
      $('#success_msg').html('Successfully aded').addClass('alert alert-success text-center');
    } else {
      return false;
    }
  })

});

