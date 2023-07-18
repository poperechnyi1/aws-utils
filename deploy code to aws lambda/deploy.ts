// compile ts to js
// create zip
// upload to aws
import * as dotenv from 'dotenv'
dotenv.config()

import * as ncc from '@vercel/ncc'
import * as jszip from 'jszip'
import * as AWS from 'aws-sdk'
import ora from 'ora'
import * as filesize from 'filesize'

const config = {
  aws: {
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
  }
}

const compile = async (): Promise<string> => {
  const fullPath = 'D:/Programing/lambda-aws/mySql-connection/index.ts'
  const res = await ncc(fullPath)
  return res.code
}

const createZip = async(code: string): Promise<Buffer> => {
  const zip = new jszip()
  zip.file('index.js', code)
  return zip.generateAsync({type: 'nodebuffer'})
}

const uploadToAws = async (zipFile: Buffer): Promise<number> => {
  const lambda = new AWS.Lambda(config.aws)
  const res = await lambda.updateFunctionCode({
    FunctionName: 'deplyment',
    ZipFile: zipFile,
  }).promise()
  console.log(res)
  return res.CodeSize
}

const deploy = async () => {
  try {
    // const spinner = ora();
    const code = await compile()
    // spinner.start('Creating an archive')
    const zipFile = await createZip(code)
    // spinner.succeed('Archive ready. size ' + filesize.filesize(code.toString().length))
    // spinner.start('Uploading to aws')
    const res = await uploadToAws(zipFile)
    // spinner.succeed('Upload done. size ' + filesize.filesize(res))
  } catch(err) {
    console.error(err)
  }
}

deploy()