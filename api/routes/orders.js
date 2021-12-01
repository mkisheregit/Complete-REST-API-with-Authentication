 const express = require('express');
 const router = express.Router();
 const mongoose = require('mongoose');
 const checkAuth = require('../middleware/check-auth');

 const Order = require('../models/order');
 const Product = require('../models/product');



 router.get('/', checkAuth, (req, res, next) => {
     Order.find({}, { _id: 1, product: 1, quantity: 1 }, (err, docs) => {
         if (!err) {
             const response = {
                 count: docs.length,
                 orders: docs.map(doc => {
                     return {
                         _id: doc._id,
                         product: doc.product,
                         quantity: doc.quantity,
                         request: {
                             type: "GET",
                             url: "http://localhost:3000/orders/" + doc._id
                         }
                     }
                 })
             }
             res.status(200).json(response);
         } else {
             res.status(404).json({
                 error: err
             });
         }
     })
 });

 router.post('/', checkAuth, (req, res, next) => {
     Product.findById(req.body.product, (err, doc) => {
         if (!doc) {
             res.status(404).json({
                 message: 'this productId doesnt exists',
             });
         } else {
             const order = new Order({
                 _id: mongoose.Types.ObjectId(),
                 product: req.body.product,
                 quantity: req.body.quantity
             });

             order.save((err, result) => {
                 if (!err) {
                     //  console.log('successfully took order');
                     res.status(201).json({
                         message: 'order added successfully',
                         createdOrder: {
                             _id: result._id,
                             product: result.product,
                             quantity: result.quantity,
                             request: {
                                 type: "GET",
                                 url: "http://localhost:3000/orders/" + result._id
                             }
                         }
                     });
                 } else {
                     //  console.log('error while posting order');
                     res.status(500).json({
                         error: err
                     });
                 }
             });
         }
     });
 });

 router.get('/:orderId', checkAuth, (req, res, next) => {
     const id = req.params.orderId;
     Order.findById(id, (err, doc) => {
         if (!err) {
             res.status(200).json({
                 _id: id,
                 product: doc.product,
                 quantity: doc.quantity,
                 request: {
                     type: "GET",
                     url: "http://localhost:3000/orders"
                 }
             });
         } else {
             //  console.log(err);
             res.status(404).json({
                 error: err
             })
         }
     })

 })

 router.patch('/:orderId', checkAuth, (req, res, next) => {
     const id = req.params.orderId;
     const updateOps = {};
     for (const ops of req.body) {
         updateOps[ops.propName] = ops.value;
     }
     Order.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: updateOps }, (err) => {
         if (!err) {
             res.status(201).json({
                 message: " order updated",
                 request: {
                     type: "GET",
                     url: "http://localhost:3000/orders/" + id
                 }
             });
         } else {
             res.status(404).json({
                 error: err
             });
         }
     })
 })

 router.delete('/:orderId', checkAuth, (req, res, next) => {
     const id = req.params.orderId;
     Order.deleteOne({ _id: id }, (err) => {
         if (!err) {
             //  console.log('deleted');
             res.status(200).json({
                 message: 'Order deleted',
                 request: {
                     type: 'POST',
                     url: 'http://localhost:3000/orders',
                     body: { product: 'ObjectId', quantity: 'Number' }
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