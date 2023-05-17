import { UserError } from "./base";

export class UserNotInVoiceChannel extends UserError {
    constructor() {
        super("Bạn phải ở trong kênh thoại để dùng lệnh này nhé!");
    }
}

export class BotInAnotherVoiceChannel extends UserError {
    constructor() {
        super("Mình đang ở trong kênh thoại khác rồi nhé!");
    }
}

export class BotNotPlaying extends UserError {
    constructor() {
        super("Mình không có phát bài nào trong máy chủ này cả");
    }
}

export class EmptyQueue extends UserError {
    constructor() {
        super("Danh sách trống trơn! :0");
    }
}

export class AlreadyPaused extends UserError {
    constructor() {
        super("Đang tam dừng rồi mà");
    }
}

export class NoResult extends UserError {
    constructor() {
        super("Xin lỗi mình không tìm thấy bài hát này ;-;");
    }
}

export class NothingIsPlaying extends UserError {
    constructor() {
        super("Hiện tại không có bài nào đang phát");
    }
}

export class NoValueVolume extends UserError {
    constructor() {
        super("Bạn vui lòng nhập một giá trị từ 0 đến 100");
    }
}
