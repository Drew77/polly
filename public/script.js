var answers = 2;

$( document ).ready(function() {
    $('.tableRow').hide();
    for (var i = 0; i< 10; i++){
        $('#row' + i).show();
    }
});


$('#addAnswer').on('click', function(){
    if (answers === 10){
        alert('You taking the piss?');
        return;
    }
    answers ++;
    var last = $('input:last');
    last.after('<input class="form-control" type="text" name="answer" placeholder="Possible Answer ' + answers + '"> ');
    
})

$('#removeAnswer').on('click', function(){
    if (answers > 2){
        var last = $('input:last');
        last.remove();
        answers --;
    }

})


$('#tableselect').on('click', 'li', function(){
    $('.tableRow').hide();
    var id = $(this).attr('id');
    var polls = $('tr');
    for (var i = id * 10; i< id *10 + 10; i++){
        $('#row' + i).show();
    }
    
})

