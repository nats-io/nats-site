+++
title = "Installing Go"
description = ""
category = "tutorials"
[menu.main]
  name = "Installing Go"
  weight = 1
  identifier = "doc-install-golang"
  parent = "Additional Documentation"
+++

In this tutorial you set up your Go environment for running NATS.

**1. Download Go.**

Go provides binary distributions for Mac OS X, Windows, and Linux. If you are using a different OS, you can download the Go source code and install from source.

Download the latest version of Go for your platform here: [https://golang.org/dl/](https://golang.org/dl/).

**2. Install Go.**

Follow the instructions for your platform to install the Go tools: [https://golang.org/doc/install#install](https://golang.org/doc/install#install). It is recommended to use the default installation settings.

- On Mac OS X and Linux, by default Go is installed to directory `/usr/local/go/`, and the GOROOT environment variable is set to `/usr/local/go/bin`.

- On Windows, by default Go is installed in the directory `C:\Go`, the GOROOT environment variable is set to `C:\Go\`, and the bin directory is added to your Path (`C:\Go\bin`).

**3. Set your GOPATH.**

Your Go working directory (GOPATH) is where you store your Go code. It can be any path you choose but must be separate from your Go installation directory (GOROOT).

The following instructions describe one way you can set your GOPATH. Refer to the official Go documentation for more details: [https://golang.org/doc/code.html](https://golang.org/doc/code.html).

**Mac OS X and Linux**

- Set the GOPATH environment variable for your workspace:

	```sh
	export GOPATH=$HOME/go
	```

- Also set the GOPATH/bin variable, which is used to run compiled Go programs.

	```sh
	export PATH=$PATH:$GOPATH/bin
	```

**Windows**

- Create a working directory that is not the same as your Go installation, for example, `C:\Users\%USERNAME%\go`, where is your default directory.

- Create the GOPATH environment variable:

	```sh
	set GOPATH=c:\Users\%USERNAME%\go
	```

- Add the GOPATH\bin environment variable to your PATH:

	```sh
	set PATH=%PATH%;%GOPATH%\bin
	```

- Create the required Go directory structure for your source code:

	- `C:\GOPATH\bin`
	- `C:\GOPATH\pkg`
	- `C:\GOPATH\src`

**4. Test your Go installation.**

Create and run the *hello.go* application described here: [https://golang.org/doc/install#testing](https://golang.org/doc/install#testing).

If you set up your Go environment correctly, you should be able to run "hello" from any directory and see the program execute successfully.
