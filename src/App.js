import React from 'react';
import './App.css';
import { storage } from './firebaseConfig';
import ImageResizer from './components/ImageResizer/ImageResizer';
class App extends React.Component {
  state = {
    file: null,
    objectUrl: null,
    buttonVisible: true,
    editorOn: false,
    editorIndex: null,
    editorOptions: {},
    sizes: [{
      width: 755,
      height: 450,
    },
    {
      width: 365,
      height: 450,
    },
    {
      width: 365,
      height: 212,
    },
    {
      width: 380,
      height: 380,
    }],
    checkSize: false,
  }

  handleChange = async (e) => {
    var _URL = window.URL || window.webkitURL;
    const file = e.target.files;
    let img, height, width;
    let _this = this;

    let { sizes, checkSize } = this.state;

    if (file && file[0]) {
      img = new Image();
      var objectUrl = _URL.createObjectURL(file[0]);
      img.onload = function () {
        width = this.width;
        height = this.height;

        _URL.revokeObjectURL(objectUrl);
        _this.setState({ file, objectUrl, width, height, buttonVisible: false });

        if( checkSize && width !== 1024 && height !== 1024) {
          alert("Wrong size")
          _this.setState({ objectUrl: null, buttonVisible: true })
          return;
        }
        
        // _this.resizeImage(365, 450);
        sizes.map(async (item) => {
          let d = await _this.resizeImage(item.width, item.height)
          item.blob = d;
          item.blobUrl = _URL.createObjectURL(d);
          _this.setState({ sizes });
        });
      };

      img.src = objectUrl;
      
      this.setState({ file, objectUrl, width, height });

    }
  }

  resizeImage = async (ctxWidth, ctxHeight) => {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var img = document.getElementById("img");

    const { height, width } = this.state;

    canvas.height = ctxHeight;
    canvas.width = ctxWidth;

    let ratio = canvas.width / width;
    let aspectRatio = (height * ratio < canvas.height) ? canvas.height / height : canvas.width / width;
    console.log(ratio, ctxHeight, ctxWidth, aspectRatio)
    ctx.drawImage(img, 0, 0, width * aspectRatio, height * aspectRatio);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
    return blob;

  }

  editImage = (item, index) => {
    this.setState({ editIndex: index, editorOn: true, editorOptions: item });
  }

  uploadNew = () => {
    this.setState({ file: null, editorOn: false, editIndex: null, buttonVisible: true });
  }

  callBack = (blob) => {
    const { sizes, editIndex } = this.state;
    var t = URL.createObjectURL(blob);
    sizes[editIndex].blob = blob;
    sizes[editIndex].blobUrl = t;
    this.setState({ sizes, editIndex: null, editorOn: false });
  }

  sendToFirebase = (index) => {
    let file = this.state.sizes[index];
    const { sizes } = this.state;
    sizes[index].loading = true;
    this.setState({ sizes })
    let id = '_' + Math.random().toString(36).substr(2, 9);
    let ref = storage.ref(`${id}-${file.width}x${file.height}.jpg`);
    ref.put(file.blob)
      .then(function (snapshot) {
        return snapshot.ref.getDownloadURL();
      })
      .then(downloadURL => {
        sizes[index].downloadUrl = downloadURL;
        sizes[index].loading = false;
        this.setState({ sizes });
        return downloadURL;
      })
  }

  render() {
    const {
      objectUrl,
      sizes,
      buttonVisible,
      editorOn,
      editorOptions,
      editIndex,
    } = this.state;

    return (
      <div className="App">
        {
          !buttonVisible &&
          <div className="download-wrapper">
            <div className="download" onClick={() => { this.uploadNew() }}> Upload New </div>
          </div>
        }
        {
          buttonVisible &&
          <>
            <div id="upload-wrapper">
              <label for="imageUpload" class="upload-label">
                <i class="fas fa-images"></i> Upload Image
              </label>
              <input className="uploader" id="imageUpload" name="imageUpload" type="file" onChange={(e) => this.handleChange(e)} name="myImage" accept="image/x-png,image/gif,image/jpeg" />
              <br/> <label 
               for="check"
               onClick={(e) =>  { this.setState({ checkSize: !this.state.checkSize }) }}> 
              <input type="checkbox"
                id="check"
                checked={this.state.checkSize} 
              /> Size should be 1024x1024 </label>
            </div>
          </>
        }

        {objectUrl &&
          <div id="preview" className="animated">
            <span>
              <img style={{ "display": "none" }} alt="" id="img" src={objectUrl} />
            </span>
          </div>
        }

        {objectUrl && sizes.map((item, index) => {
          return <div id="preview" className="animated">
            <span>
              <p>{item.width} x {item.height}</p>
              {editIndex !== index &&
                <img alt="" id="img" src={item.blobUrl} />
              }
              {editorOn && editorOptions.width && editIndex === index &&
                <ImageResizer
                  width={editorOptions.width}
                  height={editorOptions.height}
                  file={this.state.file}
                  callback={this.callBack}
                />
              }
            </span>
            {!editorOn &&
              <>
                <div className="download-wrapper">
                  <a className="download" href={item.blobUrl} download={`image-${item.width}x${item.height}`}> <i class="fas fa-download"></i> &nbsp; Download Locally </a>
                  <div className="download" onClick={() => this.editImage(item, index)}> Edit </div>
                  <div className="download firebase" onClick={() => { this.sendToFirebase(index) }}> <i class="fas fa-upload"></i> Upload to Firebase</div>
                </div>
              </>
            }
            {item.downloadUrl && !item.loading &&  !editorOn &&
              <a href={item.downloadUrl}
                className="download-url"
                target="_blank">
                {item.downloadUrl}
              </a>
            }

            {item.loading && !editorOn &&
              <div className="loader"></div>
            }
          </div>
        })
        }

      </div>

    );
  }
}

export default App;
