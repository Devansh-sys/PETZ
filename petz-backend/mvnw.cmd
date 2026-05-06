@echo off
setlocal
set MAVEN_HOME=C:\Users\2480002\AppData\Local\maven\apache-maven-3.9.6
set MVN_CMD=%MAVEN_HOME%\bin\mvn.cmd
if not exist "%MVN_CMD%" (
    echo [ERROR] Maven not found at %MAVEN_HOME%
    echo Please install Maven or update MAVEN_HOME in this file.
    exit /b 1
)
"%MVN_CMD%" %*
