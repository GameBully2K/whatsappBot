require('dotenv').config();

const qrcode = require('qrcode-terminal');

wwebVersion = '2.2407.3';


// const { Client, LocalAuth } = require('whatsapp-web.js-1.22.2-alpha.1');
const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth(),
	puppeteer: {
		args: ['--no-sandbox']
	},
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    }
});
const accessToken = process.env.CLICKUPACCESSTOKEN

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

const me = '212687053026@c.us';
const listId = '900900099034';
let authorized = new Map();

client.on ( 'message' , async message => {
	if (message.body.match(/KJA28sd4BA/) ){
		authorized[message.from]=true;
		client.sendMessage(message.from,'تمت اضافتك');
		return;
	}
	if (message.body.match(/^chokran$/i) || message.body.match(/^thank you$/i) || message.body.match(/^merci$/i) ){
		client.sendMessage(message.from,'عفوا');
		return;
	}
	if (message.body == 'Bot' ||message.body == 'bot' ){
		client.sendMessage(message.from,'مرحبا أنا بوت تاع أسد الويب عزل من الخيارات بارسال الرقم المناسب \n 1: إضافة مهمة جديدة\n 2: تفقد المهمات الخاصة بك\n 3: التحدث الى بلال ');
		return;
	}
	const contact = await message.getContact();
	switch(message.body) {
		case '1':	
			client.sendMessage(message.from,'أدخل كلمة add task متبوعة بفحوى المهمة');
			return;
		case '2':
			if (!authorized[message.from]) return client.sendMessage(message.from,'غير مرخص, أدخل الرمز السري');
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
					Authorization: accessToken
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
				client.sendMessage(me, 'khata2 f api mea '+ contact.pushname);
				client.sendMessage(message.from, 'حدث خطأ ما! تم اعلام أحد العملاء');
			}
			return;
		case '3':
			if (!authorized[message.from]) return client.sendMessage(message.from,'غير مرخص, أدخل الرمز السري');
			client.sendMessage(message.from, 'حسنا انتظر');
			client.sendMessage(me, 'ra jak msg mn end '+ contact.pushname);
			client.sendMessage(message.from, 'تم إعلام أحد العملاء! المرجو الإنتظار');
			return;
		//TEST
		/*case '4':
			client.sendMessage(message.from, 'success');
			break;*/

	}
	if(message.body.match(/^add task/i)) {
		if (!authorized[message.from]) return client.sendMessage(message.from,'غير مرخص, أدخل الرمز السري');
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
			return;
		} else {
			client.sendMessage(me, 'khata2 f api dirssal '+ contact.pushname);
			client.sendMessage(message.from, 'حدث خطأ ما! تم اعلام بلال');
			return;
		}
		
	}
});


//list id 900900099034

