const express = require("express");
const router = express.Router();
const con = require("../config/index.js");
const { hash, compare, hashSync } = require("bcrypt");
// Middleware for creating token
const { createToken } = require('../middleware/AuthenticatedUser.js');
// Message Middleware
// const { message } = require("../middleware/message.js");

// Class of User 
class User {
    login(req, res) {
        const { emailAdd, user_password } = req.body;
        const strQry =
            `
        SELECT firstName, lastName, gender, emailAdd, user_password, userRole, userProfile
        FROM Users2
        WHERE emailAdd = '${emailAdd}';
        `;
        con.query(strQry, async (err, data) => {
            if (err) throw err;
            if ((!data.length) || (data == null)) {
                res.status(401).json({
                    err:
                        "You provide a wrong email address"
                });
            } else {
                await compare(userPass,
                    data[0].userPass,
                    (cErr, cResult) => {
                        if (cErr) throw cErr;
                        // Create a token
                        const jwToken =
                            createToken(
                                {
                                    emailAdd, user_password
                                }
                            );
                        // Saving
                        res.cookie('LegitUser',
                            jwToken, {
                            maxAge: 3600000,
                            httpOnly: true
                        })
                        if (cResult) {
                            res.status(200).json({
                                msg: 'Logged in',
                                jwToken,
                                result: data[0]
                            })
                        } else {
                            res.status(401).json({
                                err: 'You entered an invalid password or did not register. '
                            })
                        }
                    })
            }
        })
    }
    fetchUsers(req, res) {
        const strQry =
            `
        SELECT user_id, firstName, lastName, gender, cellphoneNumber, emailAdd, userRole, userProfile, joinDate, cart
        FROM Users2;
        `;
        //db
        con.query(strQry, (err, data) => {
            if (err) throw err;
            else res.status(200).json(
                { results: data });
        })
    }
    fetchUser(req, res) {
        const strQry =
            `
        SELECT user_id, firstName, lastName, gender, cellphoneNumber, emailAdd, userRole, userProfile, joinDate, cart
        FROM Users2
        WHERE user_id = ?;
        `;
        //db
        con.query(strQry, [req.params.id],
            (err, data) => {
                if (err) throw err;
                else res.status(200).json(
                    { results: data });
            })

    }
    async createUser(req, res) {
        // Payload
        let userDetail = req.body;
        // Hashing user password
        userDetail.user_password = await
            hash(userDetail.user_password, 15);
        // This information will be used for authentication.
        let user = {
            emailAdd: userDetail.emailAdd,
            user_password: userDetail.user_password
        }
        // sql query
        const strQry =
            `INSERT INTO Users2
        SET ?;`;
        con.query(strQry, [userDetail], (err) => {
            if (err) {
                res.status(401).json({ err });
            } else {
                // Create a token
                const jwToken = createToken(user);
                // This token will be saved in the cookie. 
                // The duration is in milliseconds.
                res.cookie("LegitUser", jwToken, {
                    maxAge: 3600000,
                    httpOnly: true
                });
                res.status(200).json({ msg: "A user record was saved." })
            }
        })
    }
    updateUser(req, res) {
        let data = req.body;
        if (data.user_password !== null ||
            data.user_password !== undefined)
            data.user_password = hashSync(data.user_password, 15);
        const strQry =
            `
        UPDATE Users2
        SET ?
        WHERE user_id = ?;
        `;
        //db
        con.query(strQry, [data, req.params.id],
            (err) => {
                if (err) throw err;
                res.status(200).json({
                    msg:
                        "A row was affected"
                });
            })
    }
    deleteUser(req, res) {
        const strQry =
            `
        DELETE FROM Users2
        WHERE user_id = ?;
        `;
        //db
        con.query(strQry, [req.params.id],
            (err) => {
                if (err) throw err;
                res.status(200).json({
                    msg:
                        "A record was removed from a database"
                });
            })
    }
}
// Product
class Product {
    fetchProducts(req, res) {
        const strQry = `SELECT product_id, prodName, prodDescription, 
        levels, prodPrice, prodQuantity, imgURL
        FROM products2;`;
        con.query(strQry, (err, results) => {
            if (err) throw err;
            res.status(200).json({ results: results })
        });
    }
    fetchProduct(req, res) {
        const strQry = `SELECT product_id, prodName, prodDescription, 
        levels, prodPrice, prodQuantity, imgURL
        FROM products2
        WHERE id = ?;`;
        con.query(strQry, [req.params.id], (err, results) => {
            if (err) throw err;
            res.status(200).json({ results: results })
        });

    }
    addProduct(req, res) {
        const strQry =
            `
        INSERT INTO Products2
        SET ?;
        `;
        con.query(strQry, [req.body],
            (err) => {
                if (err) {
                    res.status(400).json({ err: "Unable to insert a new record." });
                } else {
                    res.status(200).json({ msg: "Product saved" });
                }
            }
        );

    }
    updateProduct(req, res) {
        const strQry =
            `
        UPDATE Products2
        SET ?
        WHERE product_id = ?
        `;
        con.query(strQry, [req.body, req.params.id],
            (err) => {
                if (err) {
                    res.status(400).json({ err: "Unable to update a record." });
                } else {
                    res.status(200).json({ msg: "Product updated" });
                }
            }
        );

    }
    deleteProduct(req, res) {
        const strQry =
            `
        DELETE FROM Products2
        WHERE product_id = ?;
        `;
        con.query(strQry, [req.params.id], (err) => {
            if (err) res.status(400).json({ err: "The record was not found." });
            res.status(200).json({ msg: "A product was deleted." });
        })
    }

}
// Export User class
module.exports = {
    User,
    Product
}