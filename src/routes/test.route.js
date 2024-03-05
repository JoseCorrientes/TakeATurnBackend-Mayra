import {Router} from 'express';

const router = Router();

router.get('/', (req, res)=>{
    res.status(200).send('El Backend esta Online.')
})

export default router;