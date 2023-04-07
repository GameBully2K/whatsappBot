const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});

const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const listId = '900900099034';
client.on ( 'message' , async message => {
	if (message.body.match(/hokran/)){
		client.sendMessage(message.from,'3afwan');
	}
});

client.on ( 'message' , async message => {
	if (message.body == 'Robot' ||message.body == 'robot' ){
		client.sendMessage(message.from,'مرحبا أنا روبوت تاع بلال عزل من الخيارات بارسال الرقم المناسب \n 1: إضافة مهمة جديدة\n 2: تفقد المهمات الخاصة بك\n 3: التحدث الى بلال ')
	}
});

client.on('message', async message => {
	const contact = await message.getContact();
	switch(message.body) {
		case '1':	
			client.sendMessage(message.from,'أدخل كلمة add task متبوعة بفحوى المهمة');
			break;
		case '2':
			client.sendMessage(message.from, 'جاري التحميل');
			const query = new URLSearchParams({
				tags: [contact.pushname]
			  }).toString();
			const tasks = await  fetch(
				`https://api.clickup.com/api/v2/list/${listId}/task?`,
				{
				  method: 'GET',
				  headers: {
					'Content-Type': 'application/json',
					Authorization: 'pk_55506138_R7480Z7LXCAELLP1FAH47OKVC5RUZG23'
				  }
				}
			  );
			if (tasks.ok) {
				const data = await tasks.json();
				let msgBody = 'طلباتك هي كالتالي: \n';
				let num=0;
				for (let i=data.tasks.length-1; i >= 0; i--) {
					if (data.tasks[i].tags[0].name === contact.pushname.toLocaleLowerCase()) {
						num++;
						msgBody = msgBody + num.toString() + '- ' + data.tasks[i].name+ ' :: ' + data.tasks[i].status.status + '\n';
					}
				}
				if (num == 0) msgBody = 'ليست لديك أي طلبات';
				client.sendMessage(message.from, msgBody);
			} else {
				client.sendMessage('212687053026@c.us', 'khata2 f api mea '+ contact.pushname);
				client.sendMessage(message.from, 'حدث خطأ ما! تم اعلام بلال');
			}
			break;
		case '3':
			client.sendMessage(message.from, 'حسنا انتظر');
			client.sendMessage('212687053026@c.us', 'ra jak msg mn end '+ contact.pushname);
			client.sendMessage('212687053026@c.us', 'push workin');
			client.sendMessage(message.from, 'تم إعلام بلال! إنه قادم');
			
			break;

	}
});

//list id 900900099034

client.on('message', async message => {
	if(message.body.match(/^add task/i)) {
		client.sendMessage(message.from, 'جاري اضافة المهمة');
		const contact = await message.getContact();
		const resp = await fetch(
			`https://api.clickup.com/api/v2/list/${listId}/task`,
			{
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json',
				Authorization: 'pk_55506138_R7480Z7LXCAELLP1FAH47OKVC5RUZG23'
			  },
			  body: JSON.stringify({
				name: message.body.slice(8),
				tags: [contact.pushname]
			  })
			}
		  );
		if (resp.ok) {
			client.sendMessage(message.from, 'تمت الإضافة بنجاح');
		} else {
			client.sendMessage('212687053026@c.us', 'khata2 f api dirssal '+ contact.pushname);
			client.sendMessage(message.from, 'حدث خطأ ما! تم اعلام بلال');
		}
		
	}
});

 
