import dotenv from 'dotenv';
dotenv.config();


// const { Client, LocalAuth } = require('whatsapp-web.js-1.22.2-alpha.1');
import qrcode from 'qrcode-terminal';
import { redisClient } from './redis.js';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

const wwebVersion = '2.2407.3';
const client = new Client({
    authStrategy: new LocalAuth(),
	puppeteer: {
		args: ['--no-sandbox'],
	},
    webVersionCache: {
        type: 'remote',
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    }
});
const accessToken = process.env.CLICKUPACCESSTOKEN
const password = process.env.PASSWORD

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

const me = process.env.WHATSAPPID;
const listId = process.env.CLICKUPLISTID;
let authorized = new Map();

client.on ( 'message' , async message => {
	if (message.body.includes(password) ){
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
				Authorization: accessToken
			  },
			  body: JSON.stringify({
				name: message.body.slice(8),
				tags: [contact.pushname]
			  })
			}
		  );
		if (resp.ok) {
			client.sendMessage(message.from, 'تمت الإضافة بنجاح\n رابط المهمة: ' + (await resp.json()).url);
			return;
		} else {
			client.sendMessage(me, 'khata2 f api dirssal '+ contact.pushname);
			client.sendMessage(message.from, 'حدث خطأ ما! تم اعلام بلال');
			return;
		}
		
	}
	if (message.body.match(/^Aichat/i) || message.body.match(/^aichat/i) ){
		//if (!authorized[message.from]) return client.sendMessage(message.from,'غير مرخص, أدخل الرمز السري');
		const oldConversation = await redisClient.get(message.from) ?? "";
		if (oldConversation.length > (10*1024) ) {
			redisClient.del(message.from);
			client.sendMessage(message.from,'لقد تجاوزت الحد الأقصى للمحادثات. تمت اعادة المحادثة');			
		}
		if (await redisClient.exists(message.from+"_count")) {
			if (await redisClient.get(message.from+"_count") > 20) {
				client.sendMessage(message.from,'لقد تجاوزت الحد الأقصى للمحادثات اليومية. عد غدا مع 7 صباحا أو اشترك في الخدمة اللامحدودة');		
				return;
			}
		}
		if (message.body.match(/^Aichat clear/i)) {
			await redisClient.del(message.from);
			client.sendMessage(message.from,'تم مسح المحادثة');
			return;
		}
		client.sendMessage(message.from,'... أنا أفكر');
		let conversation = ""

		//{"role":"user","content":"5+5"}
		if (await redisClient.exists(message.from)) {
			conversation = oldConversation+',{"role":"user","content":'+JSON.stringify(message.body.slice(7))+'}'
		} else {
			conversation = '{"role":"user","content":'+JSON.stringify(message.body.slice(7))+'}'
		}

		console.log(conversation);



		const options = {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  'Authorization': 'Bearer '+process.env.CLOUDFLAREAPIKEY
			},
			body: '{"messages":['+conversation+']}'
		  };
		  
		  try{
			const response = await fetch('https://api.cloudflare.com/client/v4/accounts/'+ process.env.CLOUDFLAREACCOUNTID +'/ai/run/@cf/meta/llama-3.1-8b-instruct', options)
			const data = await response.json();
			console.log(data);
			if (!data.success) {
				client.sendMessage(message.from, 'حدث خطأ ما! تم اعلام بلال');
				return;
			}
			client.sendMessage(message.from, data.result.response);
			await redisClient.set(
				message.from+"_count",
				await redisClient.exists(message.from+"_count") ? (parseInt(await redisClient.get(message.from+"_count"))+1).toString() : 1
			).then(() => {
				// Set expiration to 10 seconds
				redisClient.expire(message.from+"_count", 86400);
			})
			const text= JSON.stringify(data.result.response)
			console.log(text.replace("\n    *", " "));
			conversation +=',{"role":"assistant","content":'+text+'}'
			await redisClient.set(message.from, conversation)
			
		  } catch (error) {
			console.error('Error:', error);
			client.sendMessage(message.from, 'حدث خطأ ما! تم اعلام بلال');
		  }
		return;
	}
});


//list id 900900099034

