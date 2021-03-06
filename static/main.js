var isEmailValid = false;
var selectedAssemblyId = '';

$('#register').click(function () {
  $('.ui.small.modal')
    // .modal({
    //   blurring: true
    // })
    // .modal('setting', 'transition', 'vertical flip')
    .modal('show');
});

$('#signup').click(function() {
  if (isEmailValid && selectedAssemblyId) {
    var username = $('.ui.modal .username').val();
    var email = $('.ui.modal .email').val();

    $.post('/signup', {
      username: username,
      email: email,
      assembly_id: selectedAssemblyId
    }, function(result) {
      // TODO: result status handling
      $('.ui.segment.result .user-profile > span.name').text(username);
      $('.ui.segment.result .user-profile > span.email').text(email);
      
      $('.ui.segment.introduction').css('display', 'none');
      $('.ui.segment.result').css('display', 'block');
      
      $('.ui.modal').modal('hide');
    });
  } else if (!isEmailValid) {
    alert('올바른 이메일 주소를 입력해주세요.');
  } else if (!selectedAssemblyId) {
    alert('알고싶은 지역구를 선택해주세요.')
  }
})

// email validation on front-end side.
$('.ui.modal .email').focusout(function() {
  isEmailValid = isEmail($(this).val());
  
  if (isEmailValid) {
    $('.ui.modal .ui.error.message-email').css('display', 'none');
    $(this).parent().removeClass('error');
  } else {
    $('.ui.modal .ui.error.message-email').css('display', 'block');
    $(this).parent().addClass('error');
  }
});

// look for the congress-man who is a representitive for the user
['cities', 'locals', 'towns'].forEach(function (type) {
  switch(type) {
    case 'cities':
      $('#' + type).dropdown({
        onChange: function (value, text, $selectedItem) {
          getLocalList(value, function (locals) {
            $('#locals').dropdown('restore defaults');
            $('#towns').dropdown('restore defaults');

            var str = convertListToMenu(locals, 'local');

            changeSelectState('#locals', str, false);
            changeSelectState('#towns', '', false);
          });
        }
      });
      break;
    case 'locals':
      $('#' + type).dropdown({
        onChange: function (value) {
          getTownList($('#cities').dropdown('get value'), value, function (towns) {
            $('#towns').dropdown('restore defaults');

            var str = convertListToMenu(towns, 'town');

            changeSelectState('#towns', str, false);
          });
        }
      });
      break;
    case 'towns':
      $('#' + type).dropdown({
        onChange: function (value) {
          getMemberInfo($('#cities').dropdown('get value'), $('#locals').dropdown('get value'), value, function (member) {
            var defaultImg = 'http://semantic-ui.com/images/wireframe/white-image.png';

            member = JSON.parse(member.replace(/'/g, '"'));

            if (member.photo) {
              $('.ui.modal .image-profile').prop('src', member.photo);

              // 
              // change result view
              // 
              $('.ui.segment.result .image-profile').prop('src', member.photo);
              $('.ui.segment.result .assembly-name').text(member.name_kr);
              $('.ui.segment.result .assembly-district').text(member.district);
              $('.ui.segment.result .assembly-party').text(member.party);
              
              $('figure > figcaption').text(member.party + ' | ' + member.district + ' | ' + member.name_kr);
              selectedAssemblyId = member.open_assembly_idx;
            } else {
              $('.ui.modal .image-profile').prop('src', defaultImg);
            }
          });
        }
      });
      break;
  }
});

function getLocalList (cityName, callback) {
  $.get('/locals/' + cityName, function (locals) {
    callback(locals);
  });
};

function getTownList (cityName, localName, callback) {
  $.get('/towns/' + cityName + '/' + localName, function (towns) {
    callback(towns);
  });
};

function getMemberInfo (cityName, localName, townName, callback) {
  $.get('/member/' + cityName + '/' + localName + '/' + townName,
  function (member) {
    callback(member);
  });
};

function changeSelectState (selector, content, state) {
  $(selector + ' .menu').html(content);
};

function convertListToMenu (list, type) {
  var localList = [];
  var str = '';

  switch (type) {
    case 'local':
      list.result.forEach(function (item) {
        if (localList.indexOf(item.local) === -1) {
          localList.push(item.local);
          str += '<div class="item" data-value="' + item.local + '">' + item.local + '</div>';
        }
      });
      break;
    case 'town':
      list.result.forEach(function (item) {
        if (localList.indexOf(item) === -1) {
          localList.push(item);
          str += '<div class="item" data-value="' + item + '">' + item + '</div>';
        }
      });
      break;
  }
  return str;
}

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
