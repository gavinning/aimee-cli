function Msg(){
    var msg = [];

    function Msgclass() {
        this.push = function(){
            msg.push([].join.call(arguments, ' '))
        }

        this.get = function(){
            return msg
        }

        this.clear = function(){
            msg = []
        }
    }

    return new Msgclass;
}

module.exports = Msg;
