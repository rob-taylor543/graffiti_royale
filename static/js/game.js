//This is currently not bundling into our bundle.js, so none of it works on the site.
//We will likely need an array of all currently active words, then I can correctly see if one of the words was submitted. I will need to talk to Michael to figure out how to index up our score when correctly submitting a word.

//This currently only works when you hit the submit button, we will need to find a way to submit when you press the enter key. I tried searching for the answer online, but everything I found needed the use of jQuery.

window.onload = function(){
    let wordGuessed = document.querySelector(".wordGuessed");
    let submitWordGuessed = document.querySelector(".submitWordGuessed");

    submitWordGuessed.onclick = function(){console.log(wordGuessed.value)
        if(wordGuessed.value == "This will be our wordlist from Django"){

        }
    }


}

