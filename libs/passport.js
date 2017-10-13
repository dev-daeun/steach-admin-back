
const Supervisor = require('../services/supervisorService');
const Encryption = require('./encryption');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((userId, done) => {
    done(null, userId);
});

passport.deserializeUser((userId, done) => {
    done(null, userId);
});

passport.use(new LocalStrategy({ // local 전략을 세움
    usernameField: 'user',
    passwordField: 'password',
    session: true, // 세션에 저장 여부
    passReqToCallback: true,
  }, (req, user, password, done) => {
      Supervisor.findByUser(user)
      .then(result => {
            if(!result) return done(null, false, '존재하지 않는 아이디입니다.');
            return Encryption.compare(password, result.password)
            .then(correct => {
                if(!correct) return done(null, false, '잘못된 패스워드입니다.' ); 
                return done(null, result.id);
            });
      }).catch(findError => {
          return done(findError);
      });

  }));

module.exports = passport;