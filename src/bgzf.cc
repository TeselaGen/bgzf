#include <node.h>
#include <nan.h>
#include <node_buffer.h>

#include <zlib.h>
#include <cstring>
#include <cstdlib>
NAN_METHOD(InflateRawSync);


using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;
using v8::Number;
using v8::Local;
using namespace node::Buffer;

// function to export

void inflateRawSync(const Nan::FunctionCallbackInfo<v8::Value>& info){
  Nan::HandleScope scope;

  if(info.Length() < 2){
    Nan::ThrowTypeError("Wrong number of arguments. Requires 2 buffer objects");
    return;
  }
  if (!node::Buffer::HasInstance(info[0]) || !node::Buffer::HasInstance(info[1])) {
    Nan::ThrowTypeError("One or more arguments has invalid type. Requires 2 buffer objects");
    return;
  }
  Local<Object> input  = info[0]->ToObject();
  Local<Object> result = info[1]->ToObject();
  Bytef* in_buf  = (Bytef*)node::Buffer::Data(input);
  Bytef* res_buf = (Bytef*)node::Buffer::Data(result);
  int in_len  = node::Buffer::Length(input);
  int res_len = node::Buffer::Length(result);

  z_stream strm;
  strm.zalloc = Z_NULL;
  strm.zfree = Z_NULL;
  strm.opaque = Z_NULL;
  strm.avail_in = 0;
  strm.next_in = Z_NULL;

  int ret = inflateInit2(&strm, -15);
  if (ret != Z_OK){
    Nan::ThrowError("Could not decompress from buffer using zlib!");
    return;
  }

  strm.avail_in = in_len;
  strm.next_in = in_buf;
  strm.avail_out = res_len;
  strm.next_out = res_buf;

  ret = inflate(&strm, Z_NO_FLUSH);
  if (ret != Z_STREAM_END && ret != Z_OK){
    Nan::ThrowError("Could not decompress completely from buffer using zlib!");
    return;
  }
    

  (void)inflateEnd(&strm);

  info.GetReturnValue().Set(Nan::New<Number>(res_len - strm.avail_out));
}

// exposing
void Init(v8::Local<v8::Object> exports){
  exports->Set(Nan::New("inflateRawSync").ToLocalChecked(),
	       Nan::New<v8::FunctionTemplate>(inflateRawSync)->GetFunction());
}

NODE_MODULE(bgzf, Init)
