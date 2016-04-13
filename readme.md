#Aimee-cli
Aimee命令行工具


#### Install
```
npm install aimee-cli -g
```

#### Help
```
aimee -h
```


#### Example
创建一个项目
```
aimee c weixin
```

创建一个虚拟页面
```
aimee c -p home

// or use es6
aimee c -ep home
```

创建一个app模块
```
aimee c -w header

// or use es6
aimee c -ew header
```

安装一个app模块
```
aimee i header
```

卸载一个app模块
```
aimee r header
```
