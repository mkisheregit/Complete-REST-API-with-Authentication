 const express = require('express');
 const mongoose = require('mongoose');
 const path = require('path');
 const { diskStorage } = require('multer');
 const multer = require('multer');

 const checkAuth = require('../middleware/check-auth');

 const storage = multer.diskStorage({
     destination: function(req, file, cb) {
         cb(null, './uploads');
     },
     filename: function(req, file, cb) {
         cb(null, file.originalname);
     }
 });

 const fileFilter = (req, file, cb) => {
     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
         cb(null, true);
     } else {
         cb(null, false);
     }
 };

 const upload = multer({
     storage: storage,
     limits: {
         fileSize: 1024 * 1024 * 5
     },
     fileFilter: fileFilter
 });

 const Product = require('../models/product');

 const router = express.Router();


 router.get('/', (req, res, next) => {
     Product.find({}, { __v: 0 }, (err, docs) => {
         if (!err) {
             const response = {
                 count: docs.length,
                 products: docs.map(doc => {
                     return {
                         _id: doc._id,
                         name: doc.name,
                         price: doc.price,
                         productImage: doc.productImage,
                         request: {
                             type: "GET",
                             url: "http://localhost:3000/products/" + doc._id
                         }
                     }
                 })
             }
             res.status(200).json(response);
         } else {
             res.status(404).json({
                 error: err
             })
         }
     })
 })

 router.post('/', upload.single('productImage'), checkAuth, async(req, res, next) => {
     //console.log(req.file);

     const product = new Product({
         _id: mongoose.Types.ObjectId(),
         name: req.body.name,
         price: req.body.price,
         productImage: req.file.path
     });

     await product.save((err, result) => {
         if (!err) {
             //console.log('successfully added product');
             res.status(201).json({
                 message: 'product added successfully',
                 createdProduct: {
                     _id: result._id,
                     name: result.name,
                     price: result.price,
                     productImage: result.productImage,
                     request: {
                         type: "GET",
                         url: "http://localhost:3000/products/" + result._id
                     }
                 }
             });
         } else {
             //console.log('error while posting product');
             res.status(500).json({
                 error: err
             });
         }
     });
 })

 router.get('/:productId', (req, res, next) => {
     const id = req.params.productId;
     Product.findById(id, (err, doc) => {
         if (!err) {
             res.status(200).json({
                 _id: id,
                 name: doc.name,
                 price: doc.price,
                 request: {
                     type: "GET",
                     url: "http://localhost:3000/products"
                 }
             });
         } else {
             //console.log(err);
             res.status(404).json({
                 error: err
             })
         }
     })

 })

 router.patch('/:productId', checkAuth, (req, res, next) => {
     const id = req.params.productId;
     const updateOps = {};
     for (const ops of req.body) {
         updateOps[ops.propName] = ops.value;
     }
     Product.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: updateOps }, (err) => {
         if (!err) {
             res.status(201).json({
                 message: " product updated",
                 request: {
                     type: "GET",
                     url: "http://localhost:3000/products/" + id
                 }
             });
         } else {
             res.status(404).json({
                 error: err
             });
         }
     })
 })

 router.delete('/:productId', checkAuth, (req, res, next) => {
     const id = req.params.productId;
     Product.deleteOne({ _id: id }, (err) => {
         if (!err) {
             //console.log('deleted');
             res.status(200).json({
                 message: 'Product deleted',
                 request: {
                     type: 'POST',
                     url: 'http://localhost:3000/products',
                     body: { name: 'String', price: 'Number' }
                 }
             })
         } else {
             res.status(500).json({
                 error: err
             })
         }
     });

 })




 module.exports = router;