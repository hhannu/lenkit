$(document).ready(function() {
  
  $("#editbutton").click(function() {
    
    if($("#distanceinput").prop('disabled')) {
      console.log("enable inputs");
      //$("#timeinput").textinput('enable');
      $("#distanceinput").textinput('enable');
      $("#speedinput").textinput('enable');
      $("#description").textinput('enable');

      $("#editbutton").prop('value', 'Save').button("refresh");
      $("#deletebutton").prop('value', 'Cancel').button("refresh");
    }
    else {
      $('#editform').submit();
      disableInputs();
    }
    
    $(this).removeClass('ui-btn-active');
  });
  
  
  $("#deletebutton").click(function() {
    if($("#distanceinput").prop('disabled')) {
      $('#deleteform').submit();
    }
    else {      
      disableInputs();
    }      
    $(this).removeClass('ui-btn-active');
  });
  
    
  function disableInputs() {
    
    console.log("disable inputs");
    
    //$("#timeinput").textinput('disable');
    $("#distanceinput").textinput('disable');
    $("#speedinput").textinput('disable');
    $("#description").textinput('disable');

    $("#editbutton").prop('value', 'Edit track').button("refresh");
    $("#deletebutton").prop('value', 'Delete track').button("refresh");    
  }
  
});
