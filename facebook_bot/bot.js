"use strict";
var SimpleFilter = require("./bot_filter/simpleFilter");
var SpamFilter = require("./bot_filter/spamFilter");
var CategoryFilter = require("./bot_filter/categoryFilter");
var SearchFilter = require("./bot_filter/searchFilter");
var TagFilter = require("./bot_filter/tagFilter");
var ButtonFilter = require("./bot_filter/buttonFilter");
var EndFilter = require("./bot_filter/endFilter");
var async = require("asyncawait/async");
var await = require("asyncawait/await");
var fbAPI = require("./api/facebookAPI");

var BOT_REPLY_TYPE = require("./constants").BOT_REPLY_TYPE;
var BUTTON_TYPE = require("./constants").BUTTON_TYPE;
var PAYLOAD = require("./constants").PAYLOAD;

class BotAsync {
    constructor() {

        //this._helloFilter = new SimpleFilter(["hi", "halo", "hế nhô", "he lo", "hello", "chào", "xin chào"], "Chào bạn, mềnh là bot tôi đi code dạo ^_^");

        this._helloFilter = new ButtonFilter(["hi", "halo", "hế nhô", "he lo", "hello", "chào", "xin chào", "helo", "alo", "ê mày"],
            "Chào bạn, mềnh là bot tôi đi code dạo ^_^. Bạn thích đọc gì nào?", [{
                title: "Nâng cao trình độ",
                type: BUTTON_TYPE.POSTBACK,
                payload: PAYLOAD.TECHNICAL_POST
            }, {
                title: "Tìm hiểu nghề nghiệp",
                type: BUTTON_TYPE.POSTBACK,
                payload: PAYLOAD.CAREER_POST
            }, {
                title: "Các thứ linh tinh",
                type: BUTTON_TYPE.POSTBACK,
                payload: PAYLOAD.GENERIC_POST
            }]);


        var helpFilter = new ButtonFilter(["help", "giúp đỡ", "giúp với", "giúp mình", "giúp"],
            `Do bot mới được phát triển nên chỉ có 1 số tính năng sau:\n1. Hỏi linh tinh (ioc là gì, tao muốn học javascript).\n2. Tìm từ khóa với cú pháp [từ khóa] (Cho tao 4 bài [java]).\n3. Chém gió vui.\n4. Xem bài theo danh mục.`, 
            [{
                title: "Danh mục bài viết",
                type: BUTTON_TYPE.POSTBACK,
                payload: PAYLOAD.SEE_CATEGORIES
            }]);

        var botInfoFilter = new SimpleFilter(["may la ai", "may ten gi", "may ten la gi", 
        "ban ten la gi", "ban ten gi", "ban la gi",
        "bot ten gi", "bot ten la gi", "your name"],
            "Mình là chat bot Tôi đi code dạo. Viết bởi anh Hoàng đập chai cute <3");
        var adInfoFilter = new SimpleFilter(["ad la ai", "hoi ve ad", "ad ten gi", "who is ad",
                "ad la thằng nào", "thong tin ve ad", "ad dau", "admin",
                "ai viet ra may", "who made you", "ad la gi", "ad ten la gi"
            ],
            "Ad là Pham Huy Hoàng, đập chai cute thông minh tinh tế <3. Bạn vào đây xem thêm nhé: https://toidicodedao.com/about/");
        var thankyouFilter = new SimpleFilter(["cảm ơn", "thank you", "thank", "nice", "hay qua",
        "gioi qua", "good job", "hay nhi", "hay ghe"], "Không có chi. Rất vui vì đã giúp được cho bạn ^_^");
        var categoryFilter = new SimpleFilter(["category", "danh muc", "the loai", "chu de"],
            "Hiện tại blog có 3 category: coding, linh tinh, và nghề nghiệp");
        var chuiLonFilter = new SimpleFilter(["dm", "đậu xanh", "rau má", "dcm", "vkl", "vl", "du me", "may bi dien",
                "bố láo", "ngu the", "me may", "ccmm", "ccmn", "bot ngu", "đờ mờ", "fuck", "fuck you"
            ],
            "Bot là người nhân hậu, không chửi thề. Cút ngay không bố đập vỡ cmn ass bây giờ :v!");
        var testFilter = new SimpleFilter(["test"],
            "Đừng test nữa, mấy hôm nay người ta test nhiều quá bot mệt lắm rồi :'(");
        this._goodbyeFilter = new SimpleFilter(["tạm biệt", "bye", "bai bai", "good bye"], "Tạm biệt, hẹn gặp lại ;)");

        this._filters = [new SpamFilter(), new SearchFilter(), new CategoryFilter(), new TagFilter(),
            adInfoFilter, botInfoFilter, categoryFilter,
            chuiLonFilter, thankyouFilter, helpFilter,
            this._goodbyeFilter, this._helloFilter, testFilter, new EndFilter()
        ];
    }

    setSender(sender) {
        this._helloFilter.setOutput(`Chào ${sender.first_name}, mềnh là bot tôi đi code dạo ^_^. Bạn thích đọc gì nào?`);
        this._goodbyeFilter.setOutput(`Tạm biệt ${sender.first_name}, hẹn gặp lại ;)`);
    }

    chat(input) {
        for (var filter of this._filters) {
            if (filter.isMatch(input)) {
                filter.process(input);
                return filter.reply(input);
            }
        }
    }

    reply(senderId, textInput) {
        async(() => {
            var sender = await (fbAPI.getSenderName(senderId));
            this.setSender(sender);

            var botReply = await (this.chat(textInput));
            var output = botReply.output;
            switch (botReply.type) {
                case BOT_REPLY_TYPE.TEXT:
                    fbAPI.sendTextMessage(senderId, output);
                    break;
                case BOT_REPLY_TYPE.POST:
                    if (output.length > 0) {
                        fbAPI.sendTextMessage(senderId, "Bạn xem thử mấy bài này nhé ;)");
                        fbAPI.sendGenericMessage(senderId, output);
                    }
                    else {
                        fbAPI.sendTextMessage(senderId, "Xin lỗi mình không tim được bài nào ;)");
                    }
                    break;
                case BOT_REPLY_TYPE.BUTTONS:
                    let buttons = botReply.buttons;
                    fbAPI.sendButtonMessage(senderId, output, buttons);
                    break;

                default:
                    // code
            }

        })();
    }

    sendAttachmentBack(sender, attachment) {
        fbAPI.sendAttachmentBack(sender, attachment);
    }

    processPostback(senderId, payload) {
        async(() => {
            var sender = await (fbAPI.getSenderName(senderId));
            this.setSender(sender);
            switch (payload) {
                case PAYLOAD.TECHNICAL_POST:
                    this.reply(senderId, "{coding}");
                    break;
                case PAYLOAD.CAREER_POST:
                    this.reply(senderId, "{nghe nghiep}");
                    break;
                case PAYLOAD.GENERIC_POST:
                    this.reply(senderId, "{linh tinh}");
                    break;
                case PAYLOAD.SEE_CATEGORIES:
                    this.reply(senderId, "hello");
                    break;
                case PAYLOAD.HELP:
                    this.reply(senderId, "-help");
                    break;
                default:
                    console.log("Unknown payload: " + payload);
            }
        })();
    }
}

module.exports = new BotAsync();