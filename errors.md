# Frequent error messages
Here are some error messages, and what solutions you have.

## Tablet failed to respond to SCP client
This happens when the server hosted on your computer fails to connect to the tablet.
Here are some common ways this error appears:
* Tablet is off or in sleep
* Tablet isn't on the same network as the server
* Server has wrong credentials in `.env` file
    * Verify that the IP address and password match the ones diplayed under _Settings > Help > Copyrights and Licenses_.
    * Make sure that the `.env` file is saved in the root of the repository

## Couldn't find matching PDF file on the tablet
This message shows when you try to download a notebook using the "Download Unconverted" button. Because notebooks aren't stored as PDF files, the server can't retreive them.
Try downloading them normally instead (i.e. By clicking on the file name, instead of the "View unconverted")

## Conversion failed
This message usually appears when trying to download an annotated PDF whose pages have different sizes from each other.

There isn't much for you to do, except for downloading the original, unannotated PDF using the "Download Unconverted" button.