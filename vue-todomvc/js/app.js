(function (Vue) {//表示依赖了全局的vue

	const STORAGE_KEY = 'items-vuejs'
	//进行本地存储、获取数据
	const itemStorage = {
		//获取数据
		fetch :function(){
			//获取出来的是json字符串，通过parse方法将字符串转换为数组对象
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		},
		//保存数据
		save :function(items){
			localStorage.setItem(STORAGE_KEY,JSON.stringify(items))
		}
	}

	//const表示申明的变量是不可变的，ES6
	// const items =  [
	// 	{
	// 		id:1,//主键id
	// 		content: 'vue.js',//输入的内容
	// 		completed: false//是否完成
	// 	},
	// 	{
	// 		id:2,//主键id
	// 		content: 'java',//输入的内容
	// 		completed: false//是否完成
	// 	},
	// 	{
	// 		id:3,//主键id
	// 		content: 'python',//输入的内容
	// 		completed: false//是否完成
	// 	},
	// ]

	//注册全局指令
	//指令名不要加上v-，在引用这个指令时才需要加上v-
	Vue.directive('app-focus',{
		inserted(el,binding){
			//聚焦元素
			el.focus()
		},
		
	})

	var app = new Vue({
		el:'#todoapp',
		data: {
			//items,//这是对象属性的简写方式，等价于items: items
			items : itemStorage.fetch(),
			currentItem: null, //代表的是点击的那个任务项
			filterStatus: 'all'
		},

		//定义监听器
		watch: {
			//当对象中的某个属性发生改变之后，默认情况下不会被监听到
			//如果你希望修改对象属性之后，需要被监听到？
			/*items: function (newValue , old){
				console.log('watch',newValue)
			}*/
			//深度监听，当对象中的属性发生变化后，使用deep：true选择则可以实现监听
			items: {
				deep: true,
				handler: function(newItems , oldItems){
					//将数据保存到本地
					itemStorage.save(newItems)
				}
			}
		},

		//自定义局部指令
		directives : {
			'todo-focus' :{//注意指令名称
				update(el,binding){
					//聚焦元素
					//只有双击的那个元素才会获取焦点
					if(binding.value){
						el.focus()
					}
				}
			}			
		},
		

		//定义计算属性
		computed: {
			//根据不同状态过滤出不同数据
			filterItems () { //filterItems: function(){}
				//当filterStatus状态发生变化时，则过滤出不同的数据
				//判断filterStatus的状态值
				switch (this.filterStatus) {
					case 'active':
						//过滤出未完成的数据filter
						return this.items.filter(item => !item.completed)
						break;
					case 'completed':
						//过滤出已完成的数据filter
						return this.items.filter(item => item.completed)
						break;
					default:
						//当上面都不满足时，则返回所有数据
						return this.items
						break;
				}
			},


			toggleAll:{
				//当任务列表中的状态变化之后，就更新复选框的状态
				get(){		//=Es6 get	: function(){
					console.log('get',this.remaining)
					return this.remaining === 0
				},
				//当复选框的状态更新后，则将任务列表中的状态更新
				set(newStatus){
					console.log('set')
					//当点击复选框后，复选框的值发生改变，就会触发set方法调用，
					// 将迭代出数组中的所有任务项，然后将当前复制框的状态复制给每一个任务的状态值
					this.items.forEach((item) =>{//function (item){
						item.completed = newStatus
					})
				}
			},

			//计算剩余未完成任务数量
			remaining(){   //remaining: function(){}
				//数组filter函数过滤所有未完成的任务项
				//unItems用于接收过滤之后未完成的任务项，它是一个数组
				const unItems = this.items.filter(function (item){
					return !item.completed
				})
				return unItems.length
			},

		},

		// 定义函数
		methods: {
			//完成编辑，保存数据 
			finishEdit(item,index,event){
				//1、获取输入框的值
				const content =  event.target.value
				//2、判断输入框的值是否为空，如果为空，则进行删除任务
				if(!content){
					//如果为空，则进行删除任务项
					//复用了下面的函数进行移除
					this.removeItem(index)
					return
				}
				//3、如果不为空，则添加到原有任务项中，其实是做一个更新
				item.content = content
				//4、移除.editing样式，退出编辑状态
				this.currentItem = null
			},	


			//取消编辑，esc键
			cancelEdit (){
				//当this.currentItem值为空时，
				// editing：item ==== currentItem 中的item === currentItem始终为false，
				// 所以会将editing移除
				this.currentItem = null
			},


			//进入编辑状态
			toEdit(item){
				console.log(item)
				//将点击的那个任务项item赋值给currentItem，用于.editing样式生效
				this.currentItem = item

			},

			//移除所有已完成的任务项
			removeCompleted(){ // removeCompleted: function(){}
				//过滤出所有未完成任务项，重新将这个新数组（未完成任务项）赋值给items即可
				/*this.items.filter((item) =>{
					return item.completed
				})*/
				this.items = this.items.filter(item => !item.completed)
			},

			removeItem(index){
				console.log(index)
				//移除索引为index的一条数据
				this.items.splice(index,1)
			},

			addItem(event) {	//ES语法  =addItem:function(){}
				console.log("addItm",event.target.value)
				//1.获取文本框内的内容
				const content = event.target.value.trim()//trim()是去空格的
				//2.判断数据是否为空，如果为空，什么都不做
				if (!content.length) { //0=false  !false=true   
					return
				}
				//3.如果不为空，则添加到数组中
				const id = this.items.length + 1
				this.items.push(
					{
						id,// =id: id,   主键id
						content,// =content: content, //输入的内容
						completed: false //是否完成
					}
				)
				//4. 清空文本输入框的内容
				event.target.value = ''
				
			}
		},
	})

	//要写在vue实例外
	//当路由hash值发生变化后，会自动调用该函数
	window.onhashchange = function(){
		//#/active
		//获取路由的hash 用(substr方法)，当截取的hash值不为空时则返回，为空则返回‘all’
		console.log("hash值改变了",window.location.hash)
		 const hash = window.location.hash.substr(2) || 'all'
		 //状态一旦改变，就会将hash值赋值给filterStatus
		 //定义一个计算属性filterItems来感知filterStatus的变化，当它变化后，来过滤出不同的数据
		 app.filterStatus = hash
	}

	//第一次访问页面时，就调用一次让状态值生效
	window.onhashchange 


})(Vue);
