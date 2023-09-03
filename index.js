const fs = require('fs/promises')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const shortid = require("shortid");

const app = express()
const jsonParser = bodyParser.json()
app.use(cookieParser())
const sd = require('silly-datetime');

app.get('/api/hospital', (req, res) => {
    fs.readFile(path.resolve(__dirname, './hospital.json')).then(data => {
        res.setHeader('content-type', 'application/json;charset=utf-8')
        res.json(JSON.parse(data))
    }, err => {
        console.log(err);
    })
})

app.get('/api/hospitalLevel', (req, res) => {
    fs.readFile(path.resolve(__dirname, './hospitalLevel.json')).then(data => {
        res.setHeader('content-type', 'application/json;charset=utf-8')
        res.json(JSON.parse(data))
    }, err => {
        console.log(err);
    })
})

app.get('/api/hospitalLocation', (req, res) => {
    fs.readFile(path.resolve(__dirname, './hospitalLocation.json')).then(data => {
        res.setHeader('content-type', 'application/json;charset=utf-8')
        res.json(JSON.parse(data))
    }, err => {
        console.log(err);
    })
})

app.get('/api/hospital/:hoscode', (req, res) => {
    let { hoscode } = req.params
    fs.readFile(path.resolve(__dirname, `./hospital/${hoscode}.json`)).then(data => {
        res.setHeader('content-type', 'application/json;charset=utf-8')
        res.json(JSON.parse(data))
    }, err => {
        console.log(err);
    })
})

app.get('/api/hospital/getBookingScheduleRule/:hoscode/:depcode', (req, res) => {
    let { hoscode, depcode } = req.params
    fs.readFile(path.resolve(__dirname, `./bookingScheduleRule/template.json`)).then(data => {
        data = JSON.parse(data)
        fs.readFile(path.resolve(__dirname, `./hospital/${hoscode}.json`)).then(hospital => {
            hospital = JSON.parse(hospital)
            data.baseMap.releaseTime = hospital.bookingRule.releaseTime
            data.baseMap.stopTime = hospital.bookingRule.stopTime
            data.baseMap.hosname = hospital.hospital.hosname
            fs.readFile(path.resolve(__dirname, `./department.json`)).then(department => {
                department = JSON.parse(department)
                department.forEach(items => {
                    items.children.forEach(item => {
                        item.depcode = item.depcode.replace('_1', '_' + hoscode.split('_')[1])
                        if (item.depcode === depcode) {
                            data.baseMap.bigname = items.depname
                            data.baseMap.depname = item.depname
                        }
                    })
                })
                res.setHeader('content-type', 'application/json;charset=utf-8')
                res.json(data)
            }, err => {
                console.log(err);
            })
        }, err => {
            console.log(err);
        })
    }, err => {
        console.log(err);
    })
})

app.get('/api/hospital/findScheduleList/:hoscode/:depcode/:workDate', (req, res) => {
    let { hoscode, depcode, workDate } = req.params
    fs.readFile(path.resolve(__dirname, `./findScheduleList/${workDate}.json`)).then(data => {
        data = JSON.parse(data)
        fs.readFile(path.resolve(__dirname, `./hospital/${hoscode}.json`)).then(hospital => {
            hospital = JSON.parse(hospital)
            data.forEach(doctor => {
                doctor.param.hosname = hospital.hospital.hosname
                doctor.hoscode = hoscode
            })
            fs.readFile(path.resolve(__dirname, `./department.json`)).then(department => {
                department = JSON.parse(department)
                department.forEach(items => {
                    items.children.forEach(item => {
                        item.depcode = item.depcode.replace('_1', '_' + hoscode.split('_')[1])
                        if (item.depcode === depcode) {
                            data.forEach(doctor => {
                                doctor.param.depname = items.depname
                                doctor.depcode = depcode
                            })
                        }
                    })
                })
                res.setHeader('content-type', 'application/json;charset=utf-8')
                res.json(data)
            }, err => {
                console.log(err);
            })
        }, err => {
            console.log(err);
        })
    }, err => {
        console.log(err);
    })
})

app.get('/api/hospital/getSchedule/:hoscode/:depcode/:scheduleId', (req, res) => {
    let { hoscode, depcode, scheduleId } = req.params
    fs.readFile(path.resolve(__dirname, `./getSchedule/${scheduleId}.json`)).then(schedule => {
        schedule = JSON.parse(schedule)
        fs.readFile(path.resolve(__dirname, `./hospital/${hoscode}.json`)).then(hospital => {
            hospital = JSON.parse(hospital)
            schedule.param.hosname = hospital.hospital.hosname
            schedule.hoscode = hoscode
            fs.readFile(path.resolve(__dirname, `./department.json`)).then(department => {
                department = JSON.parse(department)
                department.forEach(items => {
                    items.children.forEach(item => {
                        item.depcode = item.depcode.replace('_1', '_' + hoscode.split('_')[1])
                        if (item.depcode === depcode) {
                            schedule.param.depname = item.depname
                            schedule.depcode = depcode
                        }
                    })
                })
                res.setHeader('content-type', 'application/json;charset=utf-8')
                res.json(schedule)
            }, err => {
                console.log(err);
            })
        }, err => {
            console.log(err);
        })
    }, err => {
        console.log(err);
    })
})

app.get('/api/department/:hoscode', (req, res) => {
    let { hoscode } = req.params
    fs.readFile(path.resolve(__dirname, `./department.json`)).then(data => {
        data = JSON.parse(data)
        data.forEach(departments => {
            departments.children.forEach(department => {
                department.depcode = department.depcode.replace('_1', '_' + hoscode.split('_')[1])
            })
        });
        res.setHeader('content-type', 'application/json;charset=utf-8')
        res.json(data)
    }, err => {
        console.log(err);
    })
})

app.get('/api/sms/send/:telephone', (req, res) => {
    let { telephone } = req.params
    fs.readFile(path.resolve(__dirname, `userVerification/template.json`)).then(data => {
        data = JSON.parse(data)
        data.telephone = telephone
        data.verification = Math.ceil(Math.random() * 9 * Math.pow(10, 5) + Math.pow(10, 5)).toString()
        return data
    }).then(data => {
        fs.writeFile(path.resolve(__dirname, `userVerification/${telephone}.json`), JSON.stringify(data)).then(() => {
            res.setHeader('content-type', 'application/json;charset=utf-8')
            res.json(data)
        })
    }, err => {
        console.log(err);
    })
})

app.post('/api/user/login', jsonParser, (req, res) => {
    let { telephone, verification } = req.body
    fs.readFile(path.resolve(__dirname, `userVerification/${telephone}.json`)).then(data => {
        data = JSON.parse(data)
        if (verification === data.verification) {
            let token = jwt.sign({
                telephone
            }, 'medical', {
                expiresIn: 60 * 60 * 24 * 7
            })
            res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 })
            res.setHeader('content-type', 'application/json;charset=utf-8')
            res.json({ telephone, token, code: 200 })
        } else {
            res.json({ ...data, code: 2001 })
        }
    }, err => {
        console.log(err);
    })
})

app.get('/api/user/tokenLogin', (req, res) => {
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', telephone: '' })
    }
    jwt.verify(token, 'medical', (err, data) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', telephone: '' })
        }
        res.json({ code: 200, msg: '登录正确', telephone: data.telephone })
    })
})

app.get('/api/user/logout', (req, res) => {
    res.setHeader('content-type', 'application/json;charset=utf-8')
    res.clearCookie('token')
    return res.json({})
})

app.get('/api/user/allPatients', (req, res) => {
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: [] })
    }
    jwt.verify(token, 'medical', (err, data) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: [] })
        }
        fs.readFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`)).then(patients => {
            patients = JSON.parse(patients)
            res.json({ code: 200, msg: '登录正确', data: patients })
        }, err => {
            res.json({ code: 200, msg: '登录正确', data: [] })
            console.log(err);
        })
    })
})

app.get('/api/user/getPatient/:id', (req, res) => {
    let { token } = req.cookies
    let { id } = req.params
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, data) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`)).then(patients => {
            patients = JSON.parse(patients)
            let hasData = false
            patients.forEach((patient) => {
                if (patient.id === id) {
                    hasData = true
                    return res.json({ code: 200, msg: '登录正确', data: patient })
                }
            })
            if(!hasData){
                return res.json({ code: 2005, msg: '没有对应id的数据', data: {} })
            }
        }, err => {
            console.log(err);
            return res.json({ code: 2005, msg: '没有对应id的数据', data: {} })
        })
    })
})

app.get('/api/user/removePatient/:id', (req, res) => {
    let { token } = req.cookies
    let { id } = req.params
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, data) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`)).then(patients => {
            patients = JSON.parse(patients)
            patients = patients.filter((patient) => {
                return patient.id !== id
            })
            fs.writeFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`), JSON.stringify(patients)).then(() => {
                return res.json({ code: 200, msg: '删除完毕', data: {} })
            })
        }, err => {
            console.log(err);
            return res.json({ code: 2005, msg: '没有对应id的数据', data: {} })
        })
    })
})

app.post('/api/user/submitPatient', jsonParser, (req, res) => {
    let patient = req.body
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, data) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`)).then(patients => {
            patients = JSON.parse(patients)
            let isEdited = false
            patients.forEach((oldPatient) => {
                if (oldPatient.id === patient.id) {
                    isEdited = true
                    for (const key in oldPatient) {
                        if (Object.hasOwnProperty.call(oldPatient, key)) {
                            oldPatient[key] = patient[key];
                        }
                    }
                    fs.writeFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`), JSON.stringify(patients)).then(() => {
                        res.json({ code: 200, msg: '登陆正确', data: oldPatient })
                    })
                }
            })
            if (!isEdited) {
                patient = { ...patient, id: shortid.generate() }
                patients.push(patient)
                fs.writeFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`), JSON.stringify(patients)).then(() => {
                    res.json({ code: 200, msg: '登陆正确', data: patient })
                })
            }
        }, err => {
            patient = { ...patient, id: shortid.generate() }
            let patients = [patient]
            fs.writeFile(path.resolve(__dirname, `patientInformation/${data.telephone}.json`), JSON.stringify(patients)).then(() => {
                res.json({ code: 200, msg: '登陆正确', data: patient })
            })
        })
    })

})

app.post('/api/user/submitOrder', jsonParser, (req, res) => {
    let { hoscode, depcode, scheduleId, patientId } = req.body
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, information) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `./getSchedule/${scheduleId}.json`)).then(schedule => {
            schedule = JSON.parse(schedule)
            fs.readFile(path.resolve(__dirname, `./hospital/${hoscode}.json`)).then(hospital => {
                hospital = JSON.parse(hospital)
                schedule.param.hosname = hospital.hospital.hosname
                schedule.hoscode = hoscode
                fs.readFile(path.resolve(__dirname, `./department.json`)).then(department => {
                    department = JSON.parse(department)
                    department.forEach(items => {
                        items.children.forEach(item => {
                            item.depcode = item.depcode.replace('_1', '_' + hoscode.split('_')[1])
                            if (item.depcode === depcode) {
                                schedule.param.depname = item.depname
                                schedule.depcode = depcode
                            }
                        })
                    })
                    let data = {
                        telephone: patientId,
                        date: schedule.workDate + (schedule.workTime === 0 ? ' 上午' : '下午'),
                        hospital: schedule.param.hosname,
                        department: schedule.param.depname,
                        docName: schedule.docname,
                        title: schedule.title,
                        cost: schedule.amount,
                        id: shortid.generate(),
                        createdDate: sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                        orderStatus: 0,
                        orderStatusString: '预约成功，待支付',
                    }
                    fs.readFile(path.resolve(__dirname, `orders/${information.telephone}.json`)).then(preData => {
                        preData = JSON.parse(preData)
                        preData[patientId] = (preData[patientId] == null || preData[patientId].length === 0) ? [data] : [...preData[patientId], data]
                        fs.writeFile(path.resolve(__dirname, `orders/${information.telephone}.json`), JSON.stringify(preData)).then(() => {
                            res.json({ code: 200, msg: '登陆正确', data: data })
                        })
                    }, err => {
                        let preData = {}
                        preData[patientId] = (preData[patientId] == null || preData[patientId].length === 0) ? [data] : [...preData[patientId], data]
                        fs.writeFile(path.resolve(__dirname, `orders/${information.telephone}.json`), JSON.stringify(preData)).then(() => {
                            res.json({ code: 200, msg: '登陆正确', data: data })
                        })
                    })
                }, err => {
                    console.log(err);
                })
            }, err => {
                console.log(err);
            })
        }, err => {
            console.log(err);
        })
    })
})

app.get('/api/user/orderInfo/:patientId/:orderId', (req, res) => {
    let { token } = req.cookies
    let { patientId, orderId } = req.params
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, information) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `orders/${information.telephone}.json`)).then(data => {
            data = JSON.parse(data)
            data[patientId].forEach(order => {
                if (order.id === orderId) {
                    res.json({ code: 200, msg: '登陆正确', data: order })
                }
            })
        }, err => {
            console.log(err);
        })
    })
})

app.get('/api/user/cancelOrder/:patientId/:orderId', (req, res) => {
    let { token } = req.cookies
    let { patientId, orderId } = req.params
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, information) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `orders/${information.telephone}.json`)).then(data => {
            data = JSON.parse(data)
            data[patientId].forEach(order => {
                if (order.id === orderId) {
                    order.orderStatus = -1;
                    order.orderStatusString = "取消预约"
                    fs.writeFile(path.resolve(__dirname, `orders/${information.telephone}.json`), JSON.stringify(data)).then(() => {
                        res.json({ code: 200, msg: '登陆正确', data: order })
                    })
                }
            })
        }, err => {
            console.log(err);
        })
    })
})

app.get('/api/user/userInfo', (req, res) => {
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, information) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `userInfo/${information.telephone}.json`)).then(data => {
            data = JSON.parse(data)
            res.json({ code: 200, msg: '登陆正确', data: data })
        }, err => {
            res.json({
                code: 200, msg: '登陆正确', data: {
                    username: "",
                    certificatesType: "",
                    certificatesNo: ""
                }
            })
        })
    })
})

app.post('/api/user/userCertification', jsonParser, (req, res) => {
    let { username, certificatesType, certificatesNo } = req.body
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, information) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        let data = { username, certificatesType, certificatesNo }
        fs.writeFile(path.resolve(__dirname, `userInfo/${information.telephone}.json`), JSON.stringify(data)).then(() => {
            res.json({ code: 200, msg: '登陆正确', data: data })
        })
    })
})

app.get('/api/user/userOrders', (req, res) => {
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, information) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `orders/${information.telephone}.json`)).then(data => {
            data = JSON.parse(data)
            let arr = []
            for (const key in data) {
                if (Object.hasOwnProperty.call(data, key)) {
                    arr = arr.concat(data[key]);
                }
            }
            res.json({ code: 200, msg: '登陆正确', data: arr })
        }, err => {
            res.json({
                code: 200, msg: '登陆正确', data: []
            })
        })
    })
})

app.get('/api/user/users', (req, res) => {
    let { token } = req.cookies
    res.setHeader('content-type', 'application/json;charset=utf-8')
    if (!token) {
        return res.json({ code: 2003, msg: 'token缺失', data: {} })
    }
    jwt.verify(token, 'medical', (err, information) => {
        if (err) {
            res.clearCookie('token')
            return res.json({ code: 2004, msg: 'token错误', data: {} })
        }
        fs.readFile(path.resolve(__dirname, `orders/${information.telephone}.json`)).then(data => {
            data = JSON.parse(data)
            let arr = []
            for (const key in data) {
                if (Object.hasOwnProperty.call(data, key)) {
                    arr.push(key)
                }
            }
            res.json({ code: 200, msg: '登陆正确', data: arr })
        }, err => {
            res.json({
                code: 200, msg: '登陆正确', data: []
            })
        })
    })
})

app.listen(4567, () => {
    console.log('服务已启动');
})