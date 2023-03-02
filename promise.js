//声明构造函数
function Promise(executor) {
    this.PromiseState='pending';
    this.PromiseResult=null;
    //声明属性
    // this.callback={};
    this.callbacks=[];
    //保存this值
    const _this=this;
    function resolve(data) {
        //判断Promise对象的状态是否已经改变过?
        if(_this.PromiseState!=='pending') return;
        //修改Promise对象的状态以及结果
        _this.PromiseState='fulfilled';
        _this.PromiseResult=data;

        //执行成功的回调
        /* if(_this.callback.onResolved) {
            _this.callback.onResolved(data);
        } */
        setTimeout(()=>{
            _this.callbacks.forEach(item=>{
                item.onResolved(data);
            })
        })
    }
    function reject(data) {
        //判断
        if(_this.PromiseState!=='pending') return;
        _this.PromiseState='rejected';
        _this.PromiseResult=data;

        //执行失败的回调
        /* if(_this.callback.onRejected) {
            _this.callback.onRejected(data);
        } */

        setTimeout(()=>{
            _this.callbacks.forEach(item=>{
                item.onRejected(data);
            })
        })
    }

    try {
        //执行器同步调用
        executor(resolve,reject);
    }catch(e) {
        reject(e);
    }
}
//then方法
Promise.prototype.then=function(onResolved,onRejected) {
    const _this=this;
    //判断函数参数
    if(typeof onRejected !=='function') {
        onRejected=reason=>{
            throw reason;
        }
    }
    if(typeof onResolved !=='function') {
        onResolved=value=>{
            return value;
        }
    }
    return new Promise((resolve,reject)=>{
        function callback(type) {
            try {
                let result=type(_this.PromiseResult);
                if(result instanceof Promise) {
                    result.then(v=>{
                        resolve(v);
                    },r=>{
                        reject(r);
                    })
                }else {
                    resolve(result);
                }
            }catch(e) {
                reject(e);
            }
        }
        if(this.PromiseState==='fulfilled') {
            //异步执行
            setTimeout(()=>{
                callback(onResolved);
            })
        }
        if(this.PromiseState==='rejected') {
            setTimeout(()=>{
                callback(onRejected);
            })
        }
        if(this.PromiseState==='pending') {
            /* this.callback={
                onResolved,
                onRejected
            } */

            this.callbacks.push({
                onResolved:function() {
                    callback(onResolved);
                },
                onRejected:function() {
                    callback(onRejected);
                }
            })
        }
    })
}
//catch方法
Promise.prototype.catch=function(onRejected) {
    return this.then(undefined,onRejected);
}
//resolve方法
Promise.resolve=function(value) {
    return new Promise((resolve,reject)=>{
        if(value instanceof Promise) {
            value.then(v=>{
                resolve(v);
            },r=>{
                reject(r);
            })
        }else {
            resolve(value);
        }
    })
}
//reject方法
Promise.reject=function(reason) {
    return new Promise((resolve,reject)=>{
        reject(reason);
    })
}
//all方法
Promise.all=function(promises) {
    return new Promise((resolve,reject)=>{
        let count=0;
        let arr=[];
        for(let i=0;i<promises.length;++i) {
            promises[i].then(v=>{
                count++;
                //将当前Promise对象成功的结果存入数组中去
                arr[i]=v;
                if(count===promises.length) {
                    resolve(arr);
                }
            },r=>{
                reject(r);
            })
        }
    })
}
//race方法
Promise.race=function(promises) {
    return new Promise((resolve,reject)=>{
        for(let i=0;i<promises.length;++i) {
            promises[i].then(v=>{
                //修改返回的对象的状态为成功
                resolve(v);
            },r=>{
                //修改状态为失败
                reject(r);
            })
        }
    })
}