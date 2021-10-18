# UAM Discord Bot
UAM Discord bot for timetable and stuff...

Built using Node.js



##### Installation:

```
npm install
```



##### Running locally:

```
node .
```



#### Configuration:

Create config.js file with:

* Discord client ID named "ClientID"
* USOS app key named "app_key"
* USOS app key secret named "secret"
* UAM User OAuth 1.0a offline_access token named "token"
* UAM User OAuth 1.0a offline_accesss token secret named "tokenSecret"



For now, discord bot supports non-stationary time tables.

##### Roadmap:

- [x] Working timetable in "embed" style
- [x] Some response gimmicks (ex. "*c++ release date*")
- [ ] Support for every lecture time table
- [ ] Notifications when there was a change in time table
- [ ] Support for other USOS-dependent universities
- [ ] Finder for email and (or) phone number of lecturer
- [ ] Support for different groups
- [ ] ...

