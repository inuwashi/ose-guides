"use strict";
(function( $ ) {

  $.fn.flowchat = function( options ) {

    // override options with user preferences

    var settings = $.extend({
      delay: 1500,
      startButtonId: '#startButton',
      autoStart: true,
      startMessageId: 1,
      dataJSON: null
    }, options );

    var container = $(this);

    $(function() {
      if(settings.autoStart)
        startChat(container, settings.dataJSON, settings.startMessageId, settings.delay)
    });

    // on click of Start button
    $(document).on('click', settings.startButtonId, function() {

      startChat(container, settings.dataJSON, settings.startMessageId, settings.delay)

    });
  }

  function selectOption($this, container, data, delay) {


    // get the next message
    var nextMessageId = $this.attr('data-nextId');
    var nextMessage = findMessageInJsonById(data, nextMessageId);

    // // add next message
    if (nextMessage != false){
      $this.parent().hide();
      var $userReply = $('<li class="user"><div class="text">'+ $this.html() +'</div></li>');
      container.children('.chat-window').append($userReply);
      generateMessageHTML(container, data, nextMessage, delay);
    }else if(typeof(nextMessageId)=="string"){
      if (nextMessageId.substring(0,4) == "http"){
        // console.log("Go to", nextMessageId)
        var $userReply = $('<li class="notice"><div class="text">Opening in a new tab.</div></li>');
        container.children('.chat-window').append($userReply);
        var win = window.open(nextMessageId, '_blank');
          if (win) {
              //Browser has allowed it to be opened
              win.focus();
          } else {
              //Browser has blocked it
              var $userReply = $('<li class="user"><div class="text">Please allow popups for this website.</div></li>');
              container.children('.chat-window').append($userReply);
          }
      }
    }
  }

  function startChat(container, data, startId, delay) {
    // clear chat window
    container.html("");
    container.append("<ul class='chat-window'></ul>");

    // get the first message
    var message = findMessageInJsonById(data, startId);

    // add message
    generateMessageHTML(container, data, message, delay);
  }

  function findMessageInJsonById(data, id) {

    var messages = data;

    for (var i = 0; messages.length > i; i ++)
      if (messages[i].id == id)
        return messages[i];

    return false;
  }

  function addOptions(container, data, delay, m) {

    var $optionsContainer = $('<li class="options"></li>');

    var $optionsList = $('<ul></ul>');

    var optionText = null;

    var optionMessageId = null;

    for (var i=1;i<12;i++) {

      optionText = m["option"+i]
      var fa = "";

      // Empty option text if there is not action assoicated 
      try{
        optionMessageId = m["option"+i+"_nextMessageId"]}
      catch (e){
        optionText = null;
      }
    
      // Add derived class to clqss list of specified 
      var optionClass = m["option"+i+"_class"];
      if (typeof(optionClass) == "string"){
        var elemClass = "chat_option chat_option_" + optionClass;

        // if the class is external and the FA extranl link icon 
        if (optionClass == "external"){
          var fa = "&nbsp;<i class='fa fa-external-link-square'></i>";
        }

      }else{
        var elemClass = "chat_option";
      }

      if (optionText != "" && optionText != undefined && optionText != null) {// add option only if text exists
        // console.log(optionMessageId);

        var $optionElem = $("<li data-nextId='" + optionMessageId + "' class='"+elemClass+"'>" + optionText + fa + "</li>");

        $optionElem.click(function() {
          selectOption($(this), container, data, delay)
        });

        $optionsList.append($optionElem);
      }
    }

    $optionsContainer.append($optionsList);

    return $optionsContainer;
  }

  function toggleLoader(status, container) {
    if(status=="show")
      container.children('.chat-window').append("<li class='typing-indicator'><span></span><span></span><span></span></li>");
    else
      container.find('.typing-indicator').remove();
  }

  function generateMessageHTML(container, messages, m, delay) {

    // create template if text is not null
    // console.log(m.imageUrl);
    if(m.imageUrl != '')
      var $template = $('<li class="bot"><div class="text">' + '<img src="' + m.imageUrl + '"><br/>' + m.text + '</div></li>');
    else if(m.text != null)
      var $template = $('<li class="bot"><div class="text">'+ m.text +'</div></li>');
    else
      var $template = $('');

    toggleLoader("show", container);

    container.children(".chat-window").scrollTop($(".chat-window").prop('scrollHeight'));

    // add delay to chat message
    setTimeout(function() {

      toggleLoader("hide", container);

      container.children('.chat-window').append($template);

      // if the message is a question then add options
      if (m.messageType == "Question")
        container.children('.chat-window').append(addOptions(container, messages, delay, m));

      container.children(".chat-window").scrollTop($(".chat-window").prop('scrollHeight'));

      // call recursively if nextMessageId exists
      if (m.nextMessageId != "") {
        var nextMessage = findMessageInJsonById(messages, m.nextMessageId)
        generateMessageHTML(container, messages, nextMessage, delay)
      }

    }, delay);
    // end delay

  } // end function

}( jQuery ));