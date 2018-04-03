import React from 'react';
import axios from 'axios';
// import { handler } from '../../Stripe/Stripe'
import { connect } from 'react-redux';
import { startAddCourses } from '../../actions/course';
import storage from '../../firebase/firebase';

const server = 'http://localhost:3000';

class Dashboard extends React.Component {
    state = {
        title: "",
        catagory: "",
        price: "",
        media: {
            link: []
        },
        msg: ''
    }

    handleFileUpload = (e) => {
        const file = e.target.files[0];        
        const storageRef = storage.ref('projects/'+ file.name);
        const task = storageRef.put(file).then((res) => {
            this.setState({
                //Getting the uploaded file URL
                media: {
                    link: [
                        this.state.media.link.concat(res.metadata.downloadURLs[0]) 
                    ]
                }
            })
        }).catch((e)=>{
            console.log("Error", e)
        })
    }


    // axios({
    //     url: `https://api.myrest.com/uploads`,
    //     method: 'post',
    //     data: {
    //       file,
    //       name: meta.name,      
    //     },
    //   })

    handlePayment = (e) => {
        e.preventDefault();         

        const handler = StripeCheckout.configure({
            key: 'pk_test_w4b6hSLwG2b0zTdYBD1sK4hY',
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: (token) => {
                // You can access the token ID with `token.id`.
                // Get the token ID to your server-side code for use.
                // console.log(token);
                const stripeElem = {
                    token,
                    amount: this.state.price*100,
                    description: this.state.title
                }
                console.log('Stripe Elem', stripeElem)
                axios.post(`${server}/api/course/charge`, stripeElem)
                .then((res) => {
                    console.log('Respons', res);
                    this.handleSaveData();
                }).catch(e => {
                    console.log('Error', e);
                }) 
                
            }
        });

        handler.open({
            name: 'Demo Site',
            description: 'Demo Course',
            amount: this.state.price*100
        });

        const {title, catagory, price, media} = this.state;

        const course = {
            title,
            catagory,
            price,
            media
        }

        axios({
            method: 'post', 
            url: `${server}/api/user/trainer/addcourse`,
            data: course,
            headers: {
                'Content-Type': 'application/json',
                'auth': this.props.token
            }
        })
        .then((res) => {
            console.log(res);
            this.setState({
                msg:'Successfull...'
            })
            this.props.addCourses(res.data)
        }).catch(e => {
            console.log('Err on adding Course', e)
        })
    }

    render() {
        // console.log(this.state.media)
        return (
            <div className="section light-gray-bg">
                <div className="container">
                    <h2>Upload your Course/Lecture Here</h2>
                    <form role="form" onSubmit={this.handlePayment} >
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group has-success has-feedback">
                                    <label className="control-label" for="inputSuccess3">Course Name</label>
                                    <input type="text" className="form-control" id="inputSuccess3" required="required" onChange={(e)=> {
                                        this.setState({
                                            title: e.target.value
                                        });
                                    }}/>
                                    <i className="fa fa-check form-control-feedback"></i>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group has-warning has-feedback">
                                    <label className="control-label" for="inputWarning3">Course Category</label>
                                    <select className="form-control" required="required" onChange={(e) => {
                                        this.setState({
                                            catagory: e.target.value
                                        })
                                    }}>
                                        <option value="">Select Category</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Financenance">Financenance</option>
                                        <option value="Sales">Sales</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group has-warning has-feedback">
                                    <label className="control-label" for="inputError3">Course Price</label>
                                    <input type="text" className="form-control" id="inputError3" required="required" onChange={(e) => {
                                        this.setState({
                                            price: parseInt(e.target.value)
                                        })
                                    }}/>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <input type="file" id="exampleInputFile" onChange={this.handleFileUpload}/>
                                    <p className="help-block">Upoad Your Course Documents Here.</p>
                                    {this.state.msg && <p className="help-block">{this.state.msg}</p>}
                                </div>
                            </div>
                        </div>
                        <input type="submit" className="btn btn-default" defaultValue="Pay & Upload"/>
                    </form>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    token: state.auth.token
})

const mapDispatchToProps = (dispatch) => ({
    addCourses: () => dispatch(startAddCourses)
})

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);