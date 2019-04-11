//引入express模块
const express=require("express");
//引入cors模块
const cors=require("cors");
const multer=require("multer");
const fs=require("fs");

// 创建连接池
const mysql=require("mysql");
pool=mysql.createPool({
    host:'127.0.0.1',
    user:"root",
    password:"",
    database:"hy",
    connectionLimit: 10 
});
// 创建express对象
var server=express();
//监听3000端口
server.listen(3000);

//3.2 配置静态资源目录 public
server.use(express.static("public"))
//3.3配置中间件
const bodyParser=require("body-parser")
server.use(bodyParser.urlencoded({
    extended:false
}))
//3.4配置允许访问列表
server.use(cors({
    origin:["http://127.0.0.1:8080","http://localhost:8080"],
    credentials:true
}))
// 3.41加载模块 express-session'\
const session=require("express-session");
server.use(session({// 3.42配置模块
    secret:"128位随机字符串",
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*60
    }
}))


// app.js
// 1.微信小程序首页轮播图
server.get("/home",(req,res)=>{
    var sql="select hid,hname,title,price,img,stock from hy_home";
    pool.query(sql,(err,result)=>{
        if(err) throw err;
        res.send({code:1,data:result})
    })
})
//2.微信小程序首页鲜花内容
server.get("/flower",(req,res)=>{
    var sql="select hid,hname,price,title,img,stock from hy_home_content";
    pool.query(sql,(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result});
    })
})
//3.微信小程序详情页鲜花内容 根据id查询
server.get("/pages",(req,res)=>{
    var hid=req.query.hid;
    var sql="select hid,hname,price,title,img,stock from hy_home_content where hid=?";
    pool.query(sql,[hid],(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result});
    })
})
// 4.详情分页
server.get('/listXianhua',(req,res)=>{
    var pno = req.query.pno;
    var pageSize = req.query.pageSize;
    //2:设置默认值   1   7
    if(!pno){
      pno = 1;
    }
    if(!pageSize){
      pageSize = 6;
    }
    var offset = (pno-1)*pageSize;
    pageSize = parseInt(pageSize);
    var sql="select * from hy_home_content LIMIT ?,?"
    pool.query(sql,[offset,pageSize],(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result})
    })
})
//5.微信小程序查询销量
server.get("/xiaoliang",(req,res)=>{
    var pno = req.query.pno;
    var pageSize = req.query.pageSize;
    //2:设置默认值   1  6
    if(!pno){
      pno = 1;
    }
    if(!pageSize){
      pageSize = 6;
    }
    var offset = (pno-1)*pageSize;
    pageSize = parseInt(pageSize);
    // sql语句降序查询查询销量
    var sql="select hid,hname,price,title,img,stock from hy_home_content  ORDER BY stock DESC LIMIT ?,?";
    pool.query(sql,[offset,pageSize],(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result});
    })
})
// 6.查询价格升序
server.get("/jiagejia",(req,res)=>{
    var pno = req.query.pno;
    var pageSize = req.query.pageSize;
    //2:设置默认值   1  6
    if(!pno){
      pno = 1;
    }
    if(!pageSize){
      pageSize = 6;
    }
    var offset = (pno-1)*pageSize;
    pageSize = parseInt(pageSize);
    // sql语句降序查询查询销量
    var sql="select hid,hname,price,title,img,stock from hy_home_content  ORDER BY price ASC LIMIT ?,?";
    pool.query(sql,[offset,pageSize],(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result});
    })
})
//7.查询价格降序
server.get("/jiagejian",(req,res)=>{
    var pno = req.query.pno;
    var pageSize = req.query.pageSize;
    //2:设置默认值   1  6
    if(!pno){
      pno = 1;
    }
    if(!pageSize){
      pageSize = 6;
    }
    var offset = (pno-1)*pageSize;
    pageSize = parseInt(pageSize);
    // sql语句降序查询查询销量
    var sql="select hid,hname,price,title,img,stock from hy_home_content  ORDER BY price DESC LIMIT ?,?";
    pool.query(sql,[offset,pageSize],(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result});
    })
})
//8.新品 内容
server.get("/xinpin",(req,res)=>{
    var nid=req.query.nid;
    var sql="select hid,hname,price,title,img,stock from hy_home_content where nid=?";
    pool.query(sql,[nid],(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result});
    })
})
// 9.加入购物车
server.get("/jiarugouwuche",(req,res)=>{
    var lid=1;
    var hid=req.query.hid;
    var sname=req.query.hname;
    var price=req.query.price;
    var img=req.query.img;
    // 创建sql语句 查询是否有这个商品
    var sql="select sid from hy_shopcart where hid=? AND lid=?";
    pool.query(sql,[hid,lid],(err,result)=>{
         if(err)throw err;
         console.log(hid+""+sname+""+price+""+img)
         //如果没有就加入
        if(result==0){
            var sql=`insert into hy_shopcart values(null,'${sname}','${price}','${img}',${hid},${lid},1,0)`;
        }else{
            // 否则就把商品数量加一
            var sql=`update hy_shopcart set count=count+1 where hid=${hid} AND lid=${lid}`
        }
        pool.query(sql,(err,result)=>{
            if(err) throw err;
            res.send({code:1,msg:"添加成功"})
        })
    })
})
// 购物车请求数据
server.get("/shopCart",(req,res)=>{
    var uid=1
    var sql="select * from hy_shopcart"
    pool.query(sql,(err,result)=>{
        if(err)throw err;
        res.send({code:1,data:result})
    })
})
//删除购物车商品
server.get("/shanchu",(req,res)=>{
    var sid=req.query.sid
    console.log(sid)
    var sql="delete from hy_shopcart where sid=?";
    pool.query(sql,[sid],(err,result)=>{
        res.send({code:1,msg:"删除成功"})
    })
})




 //功能十五小程序添加美食功能
 server.get("/savePriduct",(req,res)=>{
     var dname=req.query.dname;
     var ctime=req.query.ctime;
    //  创建
    var sql="insert into xz_shoplist values(null,'1.png',?,'123456','bj',?,98)";
    // 执行
    pool.query(sql,[dname,ctime],(err,result)=>{
        if(err)throw err;
        res.send({code:1,msg:"添加成功"})
    })
 })
 //功能十六:小程序上传图片
//加载multer模块
//创建模块对象
var upload=multer({dest:"upload/"});
//接收post请求
server.post("/uploadFile",upload.single("mypic"),(req,res)=>{ 
//创建新文件名
var src=req.file.originalname; //原文件名
//获取原文件后缀
var i3=src.lastIndexOf(".");
var suff=src.substring(i3); //截取i3之后的字符串
var ft=new Date().getTime();
var fr=Math.floor(Math.random()*9999);
//新文件名 防止重名 时间 四个随机数 原文件后缀名
var des=ft+fr+suff; 
var newFile=__dirname+"/public/upload/"+des;
//将临时文件移动到upload目录下并且该文件名为创建新文件名
fs.renameSync(req.file.path,newFile);
//假设登录用户uid=1;
//创建sql语句更新头像
var sql="update xz_info set avatar=? where uid=?";
pool.query(sql,[des,1],(err,result)=>{
if(err) throw err;
//返回消息 上传文件成功
res.send({code:1,msg:"上传成功"})
})
});
//功能十七:小程序-商品搜索
server.get("/search",(req,res)=>{
    //1:获取参数并且默认值
    var pno = req.query.pno;
    var pageSize = req.query.pageSize;
    var key = req.query.key;
    if(!pno){pno=1}
    if(!pageSize){pageSize=4}
    //2:创建sql
    var sql = "SELECT lid,title,price";
    sql+=" FROM xz_laptop";
    sql+=" WHERE title LIKE concat('%',?,'%')";
    sql+=" LIMIT ?,?";
    var offset = (pno-1)*pageSize;
    pageSize = parseInt(pageSize);
    pool.query(sql,[key,offset,pageSize],(err,result)=>{
       if(err)throw err;
       res.send({code:1,data:result})
    })
    
    //3:返回值 json
  })