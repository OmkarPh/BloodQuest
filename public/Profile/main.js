
(function ($) {
    "use strict";

    
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);



let allowed = ["whatsapp","diseaseString"]
function validateForm(){
    let formElements = document.getElementById("profileForm").elements;
    let done = true;
    // 1 -> profile pic     length-1  -> Submit button
    for(let i=1; i<formElements.length-1; i++){
        let field = formElements[i];
        if(field.value == "" || !field.value || !field){
            if(!allowed.includes(field.name)){
                field.style.borderBottom = "2px solid red";
                done = false;
            }
        }
    }
    if(!done)
        document.getElementById("warning").style.visibility = "visible";
    else
    document.getElementById("warning").style.visibility = "hidden";

    return done;
}

let setZero = ["diseaseCount"];
(function prepareForm(){
    let formElements = document.getElementById("profileForm").elements;
    for(let i=1; i<formElements.length-1; i++){
        let field = formElements[i];
        if(setZero.includes(field.name))
            field.value = 0;
    }
})();


function handleImageUpload(event){
    let dpShow = document.getElementById("showDP");
    dpShow.src = URL.createObjectURL(event.target.files[0]);
}