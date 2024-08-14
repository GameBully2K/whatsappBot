import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

const systemMessage = JSON.stringify(fs.readFileSync('./systemMessage.txt', 'utf8'));
console.log(systemMessage);

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