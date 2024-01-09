import express, { Request, Response } from 'express';
import multer from 'multer';
import pinataSDK, {PinataPinOptions} from '@pinata/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors({origin: '*'}));

const pinataJWTKey = process.env.PINATA_JWT;

const pinata = new pinataSDK({ pinataJWTKey: pinataJWTKey});
const upload = multer({ dest: 'uploads/' });


app.post('/uploadJson', async (req: Request, res: Response) => {
    const { body } = req;
    if (typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).send('Invalid JSON object.');
    }

    const options: PinataPinOptions = {
        pinataMetadata: {
            name: 'test.json'
        }
    };

    try {
        const result = await pinata.pinJSONToIPFS(body, options);
        res.send(res.send(result.IpfsHash));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading JSON to IPFS.');
    }
});


app.post('/uploadFile', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const readableStreamForFile = fs.createReadStream(req.file.path);
    const options:PinataPinOptions= {
        pinataMetadata: {
            name: req.file.originalname
        }
    };

    try {
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
        res.send(result.IpfsHash);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading file to IPFS.');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
