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

client.on ( 'message' , async message => {
	if (message.body.match(/obot/)){
		client.sendMessage(message.from,'مرحبا أنا روبوت تاع بلال عزل من الخيارات بارسال الرقم المناسب \n 1: إضافة مهمة \n 2: استحضار بلال')
	}
});

client.on('message', async message => {
	switch(message.body) {
		case '1':	
			client.sendMessage(message.from,'أدخل الرمز 11 متبوعا بفحوى المهمة');
			break;
		case '2':
			client.sendMessage(message.from, 'حسنا انتضر للحظة');
			const contact = await message.getContact();
			client.sendMessage('212687053026@c.us', 'ra jak msg mn end '+ contact.pushname);
			break;
	}
});

//list id 900900099034

client.on('message', async message => {
	if(message.body.match(/11/)) {
		client.sendMessage(message.from, 'جاري اضافة المهمة');
		const contact = await message.getContact();
		const resp = await fetch(
			`https://api.clickup.com/api/v2/list/900900099034/task`,
			{
			  method: 'POST',
			  headers: {
				'Content-Type': 'application/json',
				Authorization: 'pk_55506138_R7480Z7LXCAELLP1FAH47OKVC5RUZG23'
			  },
			  body: JSON.stringify({
				name: contact.pushname+ ' : ' + message.body.slice(2)
			  })
			}
		  );
		if (resp.ok) {
			client.sendMessage(message.from, 'تمت الإضافة بنجاح');
		} else {
			client.sendMessage(message.from, 'حدث خطأ ما؟ تم اعلام بلال');
			client.sendMessage('212687053026@c.us', 'khata2 f api mea '+ contact.pushname);
		}
		
	}
});

 